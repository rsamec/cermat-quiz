import argparse
import asyncio
import os
import json
import sys
from collections import defaultdict
from typing import Dict
from utils.notebook_lm_utils import read_zip_directory_contents_flat, createWithSources, generateArfifacts

parser = argparse.ArgumentParser(description="Example CLI")
parser.add_argument("--code", type=str)
args = parser.parse_args()
code = args.code
zip_path = os.path.join(os.getcwd(),"src", ".observablehq","cache","ctedu", "word-problem.zip")

files = read_zip_directory_contents_flat(zip_path, code)

def load_existing_source(data_path: str) -> Dict[str, int]:
    """
    Load existing source mapping from JSON file.

    Returns:
        Dict[str, int]: Mapping of artifacts_id -> id.
        Returns empty dict if file does not exist or is invalid.
    """
    if not os.path.exists(data_path):
        return {}
    
    with open(data_path, "r") as f:
        data = json.load(f)

    return {
        item["artifacts_id"]: item["id"]
        for item in data
    }

async def run_task(code:str):
    notebook_id = await createWithSources(code, files)
    # data_path = os.path.join(os.getcwd(),"src", "notebook-lm","data", f"temp-artifacts-{code}.json")
    # existing_artificats = load_existing_source(data_path)
    existing_artificats = {}
    artifact_source = await generateArfifacts(notebook_id, existing_artificats, {"infographic":True, "audio": True}, False)
    return artifact_source

artifacts = asyncio.run(run_task(code))


result = [
    {"artifacts_id":artifacts_id, "id":id_}
    for artifacts_id, id_ in artifacts.items()
]
# print(f"{output}")
sys.stdout.write(json.dumps(result, ensure_ascii=False))



