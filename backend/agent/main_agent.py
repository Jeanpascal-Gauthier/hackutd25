from . import tools
from langchain_nvidia_ai_endpoints import ChatNVIDIA
from pydantic import BaseModel
from typing import Optional, List, Any, Sequence, Annotated, TypedDict
import os
import json
from dotenv import load_dotenv
from openai import OpenAI
from langchain.messages import AnyMessage
from langchain.agents import create_agent

load_dotenv()

print(os.getenv("NVIDIA_API_KEY"))

class Step(TypedDict):
    description: str
    step_number: int

class Context(TypedDict):
    work_order_title: str
    work_order_description: str
    messages: list[AnyMessage]

class AgentContext(TypedDict):
    work_order_title: str
    work_order_description: str
    priority: str
    category: str
    estimated_expertise_level: str
    step: Step
    messages: list[AnyMessage]

llm = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=os.getenv("NVIDIA_API_KEY")
)

agent_model = ChatNVIDIA(
    base_url="https://integrate.api.nvidia.com/v1",
    model="nvidia/nvidia-nemotron-nano-9b-v2",
    temperature=0.0,
    api_key=os.getenv("NVIDIA_API_KEY")
)

agent_prompt = f"""
You are a data center AI assistant. Your job is to execute tasks given the tools available to you, and create an execution plan according to the description of each step.

Return a JSON object with:
    - executor, either "agent" or "technician", representing who will execute the task. If this value is "agent", then it is expected that you will also have a tool call in your response.

DO NOT ESCAPE OR USE ANY SPECIAL NON-VALID JSON STRUCTURE. THIS INCLUDES CODE BLOCKS IN MARKDOWN.
"""

agent = create_agent(
    model=agent_model,
    tools=[tools.reboot_server],
    system_prompt=agent_prompt
)

def run_agent(state: Context):
    prompt = f"""
You are a data center expert AI assistant. Do not overcomplicate things, but provide enough details so that someone of relative expertise in the field would understand you. Be concise. You received the following ticket:

Title: {state['work_order_title']}
Description: {state['work_order_description']}

1. Decide the priority (low, medium, high)
2. Decide the category (reboot, hardware, network, other)
3. Decide estimated technician expertise (junior, mid, senior)
4. Generate a step-by-step workflow plan. For each step:
   - description, a concise one or two sentence description of how to execute the step.
   - step_number, a whole number representing the order of the step

Return a JSON object with:
- priority
- category
- estimated_expertise_level
- steps: list of steps

DO NOT ESCAPE OR USE ANY SPECIAL NON-VALID JSON STRUCTURE. THIS INCLUDES CODE BLOCKS IN MARKDOWN.
"""

    result = llm.chat.completions.create(
        model="nvidia/nvidia-nemotron-nano-9b-v2",
        messages=[{"role": "system", "content": prompt}]
    )

    data = json.loads(result.choices[0].message.content)
    print(result)

    messages = []
    for step in data['steps']:
        messages.append({"role": "user", "content": f"""
    Work Order Title: {state['work_order_title']}
    Work Order Description: {state['work_order_description']}
    Priority: {data['priority']}
    Category: {data['category']}
    Estimated Expertise Level: {data['estimated_expertise_level']}
    Step:
        - Order: {step['step_number']}
        - Description: {step['description']}
    """})
        result = agent.invoke({
            "messages": messages
        })
        mapped = list(map(lambda x: (x.content, x.tool_calls), result['messages']))
        print()
        print(mapped)