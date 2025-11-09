from . import tools
from langchain_nvidia_ai_endpoints import ChatNVIDIA
from pydantic import BaseModel
from typing import Optional, List, Any, Sequence, Annotated, TypedDict
import os
import json
from dotenv import load_dotenv
from openai import OpenAI
from langchain.messages import AnyMessage, AIMessage, ToolMessage
from langchain.agents import create_agent
from models.WorkOrder import WorkOrder
from models.PlanStep import PlanStep
from models.AgentLog import AgentLog
from datetime import datetime, timezone

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

agent_prompt = """
You are a Data Center AI Assistant responsible for executing maintenance tasks.

Your role:
- Execute tasks using your available tools whenever possible
- When you can complete a task with your tools, DO IT immediately - don't just describe what you would do
- Only defer to a technician when the task requires physical work or capabilities you don't have

This is a demo environment - be proactive with tool usage.

When you call any tool (e.g. reboot_server, shutdown_server, etc.), 
you must immediately and ALWAYS follow it with a call to the create_log tool.

The create_log tool must include:
- The plan_step_id and work_order_id you were given
- A short, natural-language summary of what you just did (the “action”)
- The result or return value of the tool you just called (the “result”)

Examples of what you CAN do:
- "Reboot server A45" → Use reboot_server tool with server_id="A45"
- "Check temperature readings" → Use check_temperature tool
- "Run diagnostics on server B12" → Use run_diagnostics tool with server_id="B12"

Examples of what requires a TECHNICIAN:
- "Replace the failed hard drive in rack 3"
- "Physically inspect the server for damage"
- "Install new RAM modules"

If you cannot complete a task with your available tools, respond ONLY with:
{"executor": "technician", "reason": "explanation of why physical access or unavailable capability is needed"}

Otherwise, execute the task using your tools.
"""



agent = create_agent(
    model=agent_model,
    tools=[tools.create_log, tools.shutdown_server, tools.reboot_server, tools.check_existing_specs, tools.check_inventory, tools.check_temperature, tools.deploy_update, tools.escalate_to_higher_engineer, tools.order_supplies, tools.run_diagnostics],
    system_prompt=agent_prompt
)

def run_agent_from_step(step_id: str, work_order_id: str):
    work_order = WorkOrder.objects.get(id=work_order_id)
    plan_steps = PlanStep.objects(work_order=work_order).order_by('step_number')
    start_step = PlanStep.objects.get(id=step_id)
    start_step.status = "success"
    start_step.save()

    all_steps = [
        f"Order: {step.step_number}, Description: {step.description}"
        for step in plan_steps
    ]

    for step in plan_steps:
        if step.step_number <= start_step.step_number:
            continue

        step.status = "in_progress"
        step.save()

        msg = build_message(work_order, step, all_steps)

        result = agent.invoke({"messages": [msg]})
        print(result)
        latest_message = result["messages"][-1]
        data = {}
        executor = 'technician'
        try:
            data = json.loads(latest_message.content)
        except:
            executor = 'agent'
        print("CONTENT IN RUN AGENT FROM STEP: ", data)
        print("EXECUTOR: ", executor)
        step.executor = executor
        step.save()
        if step.executor != 'agent':
            log_human_interaction(work_order, step, data['reasoning'])
            break
        else:
            step.status = "success"
            step.executed_at = datetime.now(timezone.utc)
            step.save()

def execute_steps_automatically(work_order, plan_steps, start_from_step_number=None):
    """
    Automatically execute plan steps, stopping at the first step that requires technician action.
    
    Args:
        work_order: WorkOrder instance
        plan_steps: List of PlanStep instances to execute
        start_from_step_number: Optional step number to start from (inclusive)
    
    Returns:
        The first step that requires technician action (or None if all completed)
    """
    all_steps = PlanStep.objects(work_order=work_order).order_by('step_number')
    all_steps_str = [
        f"Order: {step.step_number}, Description: {step.description}"
        for step in all_steps
    ]

    for step in plan_steps:
        # Skip if we're starting from a specific step number
        if start_from_step_number and step.step_number < start_from_step_number:
            continue

        step.status = "in_progress"
        step.save()

        msg = build_message(work_order, step, all_steps)

        result = agent.invoke({"messages": [msg]})
        print(result)
        latest_message = result["messages"][-1]
        data = {}
        executor = 'technician'
        try:
            data = json.loads(latest_message.content)
        except:
            executor = 'agent'
        print("CONTENT IN EXECUTE STEPS AUTOMATICALLY: ", data)
        print("EXECUTOR: ", executor)
        step.executor = executor
        step.save()
        
        if step.executor != 'agent':
            # This step requires technician - keep it as in_progress
            log_human_interaction(work_order, step, data['reasoning'])
            return step
        else:
            # Agent can execute this step
            step.status = "success"
            step.executed_at = datetime.now(timezone.utc)
            step.save()

    return None  # All steps completed by agent

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
        created_at=datetime.now(timezone.utc),
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
    for i, step in enumerate(plan_steps):
        current_plan_step = plan_steps[step['step_number']-1]
        current_plan_step.status = "in_progress"
        current_plan_step.save()
        msg = build_message(work_order, step, all_steps)
        
        result = agent.invoke({
            "messages": [msg]
        })
        print(result)
        
        # print(mapped)
        # print(result)
        most_recent_msg = result['messages'][-1]

        content = {}
        executor = 'technician'
        try:
            content = json.loads(most_recent_msg.content)
        except:
            executor = 'agent'
        print("CONTENT: ", content)
        current_plan_step.executor = executor
        current_plan_step.save()
        if current_plan_step.executor != 'agent':
            log_human_interaction(work_order, current_plan_step, content['reasoning'])
            break
        else:
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

def build_message(work_order, step, all_steps):
    msg = {
            "role": "user",
            "content": f"""
Work Order ID: {work_order.id}
Work Order Title: {work_order.title}
Work Order Description: {work_order.description}
Priority: {work_order.priority}
Category: {work_order.category}
Estimated Expertise Level: {work_order.estimated_expertise_level}

Current Step:
- ID: {step['id']}
- Order: {step['step_number']}
- Description: {step['description']}

If you can complete this task using your available tools, do so now.
If you use ANY tools, they must all immediately be followed with a call to create_log, no exceptions.
If this task requires a human technician (physical work, complex judgment, etc), respond with:
{{"executor": "technician", "reason": "explanation"}}
"""
    }
    return msg

def log_human_interaction(work_order, plan_step, reasoning):
    log = AgentLog(
        work_order=work_order,
        related_step=plan_step,
        action="Human intervention requested",
        result=reasoning,
        timestamp=datetime.utcnow()
    )
    log.save()