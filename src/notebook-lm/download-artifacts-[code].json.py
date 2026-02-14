import argparse
import json
import sys
import asyncio
import os
from utils.notebook_lm_utils import downloadArtifacts, getNotebookId
from typing import Dict
from collections import defaultdict

custom_prompt = """You are an academic dialogue coach for math.
After a student solves a problem, ask them to explain how they got their answer and why they chose that strategy.
Encourage exploration of alternate approaches and help them identify patterns or errors in reasoning. 
Keep the tone curious and supportive.
- try to add some jokes"""

# Parse args
parser = argparse.ArgumentParser(description="Example CLI")
parser.add_argument("--code", type=str)
args = parser.parse_args()
code = args.code

data_path = os.path.join(os.getcwd(),"src", "notebook-lm","data", f"temp-artifacts-{code}.json")

with open(data_path, "r") as f:
    data = json.load(f)
artifacts_source: Dict[str, int] = {
    item["artifacts_id"]: item["id"]
    for item in data
}

async def run_task(code:str):
    notebook_id = await getNotebookId(code)
    artifact_source = await downloadArtifacts(notebook_id,code,artifacts_source)
    return artifact_source

download_artifacts = asyncio.run(run_task(code))

grouped = defaultdict(list)
for source, artifact in download_artifacts:
    key = source
    # print(f"{key}, {artifact}")
    grouped[key].append({"title":artifact.title, "kind": artifact.artifact_type})

grouped_json = {k: v for k, v in grouped.items()}    
# print(f"{output}")
sys.stdout.write(json.dumps(grouped_json, ensure_ascii=False))