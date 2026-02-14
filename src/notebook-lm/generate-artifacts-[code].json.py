import argparse
import asyncio
import os
import json
import sys
from collections import defaultdict
from utils.notebook_lm_utils import read_zip_directory_contents_flat, createWithSources, generateArfifacts

parser = argparse.ArgumentParser(description="Example CLI")
parser.add_argument("--code", type=str)
args = parser.parse_args()
code = args.code
zip_path = os.path.join(os.getcwd(),"src", ".observablehq","cache","ctedu", "word-problem.zip")

files = read_zip_directory_contents_flat(zip_path, code)
async def run_task(code:str):
    notebook_id = await createWithSources(code, files)
    artifact_source = await generateArfifacts(notebook_id, {"infographic":True, "audio": True}, False)
    return artifact_source

artifacts = asyncio.run(run_task(code))


result = [
    {"artifacts_id":artifacts_id, "id":id_}
    for artifacts_id, id_ in artifacts.items()
]
# print(f"{output}")
sys.stdout.write(json.dumps(result, ensure_ascii=False))



