import argparse
import asyncio
import os
import json
import sys
from collections import defaultdict
from utils.notebook_lm_utils import read_zip_directory_contents_flat, createWithSources, generateArfifacts, downloadArtifacts

parser = argparse.ArgumentParser(description="Example CLI")
parser.add_argument("--period", type=str)
args = parser.parse_args()
period = args.period
zip_path = os.path.join(os.getcwd(),"src", ".observablehq","cache","ctedu", "word-problem.zip")

files = read_zip_directory_contents_flat(zip_path, period)
async def run_task(period:str):
    notebook_id = await createWithSources(period, files)
    artifact_source = await generateArfifacts(notebook_id, {"infographic":True, "audio": True}, True),
    result = await downloadArtifacts(notebook_id, period, artifact_source)
    return result

download_artifacts = asyncio.run(run_task(period))

grouped = defaultdict(list)
for source, artifact in download_artifacts:
    key = source
    # print(f"{key}, {artifact}")
    grouped[key].append({"title":artifact.title, "kind": artifact.artifact_type})

grouped_json = {k[0]: v for k, v in grouped.items()}    
# print(f"{output}")
sys.stdout.write(json.dumps(grouped_json, ensure_ascii=False))



