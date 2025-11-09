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
from models.WorkOrder import WorkOrder
from models.PlanStep import PlanStep
from datetime import datetime

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
    print("--------------------------------")
    print(result)
    print()
    print(data)
    print("--------------------------------")

    work_order = WorkOrder(
        title=state['work_order_title'],
        description=state['work_order_description'],
        priority=data['priority'],
        category=data['category'],
        estimated_expertise_level=data['estimated_expertise_level'],
        status="pending",
        created_at=datetime.utcnow(),
    )

    work_order.save()

    plan_steps = [
        PlanStep(
            work_order=work_order,
            step_number=step['step_number'],
            description=step['description'],
            executor="undecided",
            status="pending",
            result=None,
            executed_at=None
        ) for step in data['steps']
    ]

    PlanStep.objects.insert(plan_steps)

    all_steps = list(map(lambda x: f"Order: {x['step_number']}, Description: {x['description']}", data['steps']))
    for i, step in enumerate(data['steps']):
        current_plan_step = plan_steps[step['step_number']-1]
        current_plan_step.status = "in_progress"
        current_plan_step.save()
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

        content = json.loads(most_recent_msg.content)
        current_plan_step.executor = content['executor']
        current_plan_step.save()
        if content['executor'] != 'agent':
            break
        else:
            print("HADSHFJKSDFHJKASDHFJKSDHF")
            print("HADSHFJKSDFHJKASDHFJKSDHF")
            print("HADSHFJKSDFHJKASDHFJKSDHF")
            print("HADSHFJKSDFHJKASDHFJKSDHF")
            print("HADSHFJKSDFHJKASDHFJKSDHF")
            print("HADSHFJKSDFHJKASDHFJKSDHF")
            current_plan_step.status = "success"
            current_plan_step.executed_at = datetime.utcnow()

        current_plan_step.save()

def regenerate_steps_from_issue(work_order, issue_description, from_step_number, completed_steps):
    """
    Regenerate PlanSteps from a specific step onwards, taking into account an issue description.
    
    Args:
        work_order: WorkOrder instance
        issue_description: Description of the issue encountered
        from_step_number: The step number to regenerate from (inclusive)
        completed_steps: List of completed steps before the issue (for context)
    
    Returns:
        List of new step dictionaries with step_number and description
    """
    # Build context of completed steps
    completed_steps_context = ""
    if completed_steps:
        completed_steps_context = "\n\nCompleted steps so far:\n"
        for step in completed_steps:
            completed_steps_context += f"  Step {step.step_number}: {step.description}\n"
            if step.result:
                completed_steps_context += f"    Result: {step.result}\n"
    
    prompt = f"""
You are a data center expert AI assistant. A technician encountered an issue while executing a work order and needs you to regenerate the remaining steps.

Work Order:
Title: {work_order.title}
Description: {work_order.description}
Priority: {work_order.priority}
Category: {work_order.category}
Estimated Expertise Level: {work_order.estimated_expertise_level}
{completed_steps_context}

Issue Encountered:
The technician encountered an issue at step {from_step_number}. The issue description is:
{issue_description}

Your task:
1. Analyze the issue and understand what went wrong
2. Generate a new set of steps starting from step {from_step_number} that:
   - Addresses the issue that was encountered
   - Provides an alternative approach or solution
   - Continues the work order to completion
   - Takes into account what was already completed (the completed steps above)

For each new step:
   - description: A concise one or two sentence description of how to execute the step
   - step_number: A whole number starting from {from_step_number}

Return a JSON object with:
- steps: list of steps (each with step_number and description)

DO NOT ESCAPE OR USE ANY SPECIAL NON-VALID JSON STRUCTURE. THIS INCLUDES CODE BLOCKS IN MARKDOWN.
"""

    result = llm.chat.completions.create(
        model="nvidia/nvidia-nemotron-nano-9b-v2",
        messages=[{"role": "system", "content": prompt}]
    )

    data = json.loads(result.choices[0].message.content)
    return data['steps']