import argparse
import json
import sys
import asyncio
from utils.notebook_lm_utils import downloadArtifacts

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

artifacts = asyncio.run(downloadArtifacts(period))
artifacts_converted = [(a.id, a.title) for a in artifacts]
result = [
    {"id": id, "title": title}
    for id, title in artifacts_converted
]
sys.stdout.write(json.dumps(result, ensure_ascii=False) )
