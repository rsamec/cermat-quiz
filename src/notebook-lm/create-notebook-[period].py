import argparse
import asyncio
import os
from utils.notebook_lm_utils import read_zip_directory_contents_flat, createWithSources

parser = argparse.ArgumentParser(description="Example CLI")
parser.add_argument("--period", type=str)
args = parser.parse_args()
period = args.period
zip_path = os.path.join(os.getcwd(),"src", ".observablehq","cache","ctedu", "word-problem.zip")
print(zip_path)

results = read_zip_directory_contents_flat(zip_path, period)
result = asyncio.run(createWithSources(period, results))

