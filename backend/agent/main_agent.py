from . import tools
from langchain_nvidia_ai_endpoints import ChatNVIDIA
from pydantic import BaseModel
from typing import Optional, List, Any, Sequence, Annotated
from langgraph.graph.message import add_messages
import os
import json
import dotenv

dotenv.load_dotenv('../.env')

print(os.getenv("NVIDIA_API_KEY"))

llm = ChatNVIDIA(
    base_url="https://integrate.api.nvidia.com/v1",
    model="nvidia/nvidia-nemotron-nano-9b-v2",
    temperature=0.0,
    api_key=os.getenv("NVIDIA_API_KEY")
)


# print([model.id for model in llm.available_models if model.model_type])

llm_with_tools = llm.bind_tools([tools.reboot_server])

class Step(BaseModel):
    step_number: int
    description: str
    executor: str
    tool: Optional[str] = None
    args: Optional[dict] = None
    result: Optional[str] = None
    status: str = "pending"

class AgentState(BaseModel):
    work_order_title: str
    work_order_description: str
    priority: Optional[str] = None
    category: Optional[str] = None
    estimated_expertise_level: Optional[str] = None
    steps: List[Step] = []
    messages: Annotated[Sequence[Any], add_messages] = []


def run_agent(state: AgentState):
    prompt = f"""
You are a data center AI assistant. You received the following ticket:

Title: {state.work_order_title}
Description: {state.work_order_description}

1. Decide the priority (low, medium, high)
2. Decide the category (reboot, hardware, network, other)
3. Decide estimated technician expertise (junior, mid, senior)
4. Generate a step-by-step workflow plan. For each step:
   - description
   - executor: "agent" or "technician"
   - tool: optional (Python function to call)
   - args: optional arguments for the tool

Return a JSON object with:
- priority
- category
- estimated_expertise_level
- steps: list of steps
"""

    # Invoke the LLM
    response = llm_with_tools.invoke(prompt)

    # -------------------------
    # Step 1: extract content safely
    # -------------------------
    if hasattr(response, "content"):
        content = response.content
    else:
        content = str(response)

    state.messages.append({"type": "ai_message", "content": content})

    # -------------------------
    # Step 2: parse JSON safely
    # -------------------------
    try:
        plan = json.loads(content)
    except json.JSONDecodeError:
        # fallback: just log raw content
        state.messages.append({"type": "error", "content": "Failed to parse JSON from agent output"})
        plan = {"steps": []}

    print(plan)
    # -------------------------
    # Step 3: fill state with plan
    # -------------------------
    state.priority = plan.get("priority")
    state.category = plan.get("category")
    state.estimated_expertise_level = plan.get("estimated_expertise_level")

    for i, s in enumerate(plan.get("steps", [])):
        step = Step(
            step_number=i+1,
            description=s["description"],
            executor=s["executor"],
            tool=s.get("tool"),
            args=s.get("args")
        )
        state.steps.append(step)

    # -------------------------
    # Step 4: execute agent tools
    # -------------------------
    for step in state.steps:
        if step.executor == "agent" and step.tool:
            tool_func = getattr(tools, step.tool)
            try:
                step.result = tool_func(**(step.args or {}))
                step.status = "completed"
                state.messages.append({"type": "tool_execution", "step_number": step.step_number, "tool": step.tool, "result": step.result})
            except Exception as e:
                step.status = "failed"
                state.messages.append({"type": "tool_execution_error", "step_number": step.step_number, "tool": step.tool, "error": str(e)})
        else:
            state.messages.append({"type": "technician_step", "step_number": step.step_number, "description": step.description})

    return state

