import argparse
import asyncio
import os
import json
import sys
from collections import defaultdict
from utils.notebook_lm_utils import read_zip_directory_contents_flat, createWithSources, generateArfifacts

parser = argparse.ArgumentParser(description="Example CLI")
parser.add_argument("--period", type=str)
args = parser.parse_args()
period = args.period
zip_path = os.path.join(os.getcwd(),"src", ".observablehq","cache","ctedu", "word-problem.zip")

files = read_zip_directory_contents_flat(zip_path, period)
async def run_task(period:str):
    notebook_id = await createWithSources(period, files)
    artifact_source = await generateArfifacts(notebook_id, {"infographic":True, "audio": True}, False)
    return artifact_source

artifacts = asyncio.run(run_task(period))


result = [
    {"artifacts_id":artifacts_id, "id":id_}
    for artifacts_id, id_ in artifacts.items()
]
# print(f"{output}")
sys.stdout.write(json.dumps(result, ensure_ascii=False))



