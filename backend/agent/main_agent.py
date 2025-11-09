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
    temperature=0.2,
    api_key=os.getenv("NVIDIA_API_KEY")
)

agent_prompt = f"""
You are a Data Center AI Assistant. Your job is to decide who executes each task.

Context:
- You will receive a list of all steps (past and future) so you don't repeat actions.
- You will also receive the current step to execute.
- Available tools:
  - restart_server: Restart a specific server.
  - check_temperature: Check the temperature of a rack or unit.
  - deploy_update: Deploy a software update to a machine group.

Decision process:
1. Read the current step.
2. If any of the tools can complete the task, set "executor" to "agent" and include the tool call.
3. If none of the tools can perform the task, set "executor" to "technician".
4. Return ONLY the JSON object below.

Required output format:
{{
  "executor": "agent" | "technician"
}}

Rules:
- If "executor" is "agent", include a valid tool call.
- If "executor" is "technician", include NO tool call.
- Output only valid JSON (no markdown, no explanations, no code blocks).
- Never include extra keys or escaped characters.
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

    all_steps = list(map(lambda x: f"Order: {x['step_number']}, Description: {x['description']}", data['steps']))
    for step in data['steps']:
        msg = {"role": "user", "content": f"""
    Work Order Title: {state['work_order_title']}
    Work Order Description: {state['work_order_description']}
    Priority: {data['priority']}
    Category: {data['category']}
    Estimated Expertise Level: {data['estimated_expertise_level']}
    Current Step:
        - Order: {step['step_number']}
        - Description: {step['description']}

    All Steps:
        {chr(10).join(all_steps)}
    """}
        result = agent.invoke({
            "messages": [msg]
        })
        # print(mapped)
        # print(result)
        most_recent_msg = result['messages'][-1]
        content = json.loads(most_recent_msg['content'])
        if content['executor'] != 'agent':
            break