import argparse
import asyncio
from utils.notebook_lm_utils import generateArfifacts

custom_prompt = """You are an academic dialogue coach for math.
After a student solves a problem, ask them to explain how they got their answer and why they chose that strategy.
Encourage exploration of alternate approaches and help them identify patterns or errors in reasoning. 
Keep the tone curious and supportive.
- try to add some jokes"""


# Parse args
parser = argparse.ArgumentParser(description="Example CLI")
parser.add_argument("--period", type=str)
args = parser.parse_args()
period = args.period

asyncio.run(generateArfifacts(period))
