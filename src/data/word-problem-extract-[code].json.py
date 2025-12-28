import langextract as lx
import textwrap
import sys
import pathlib
import json
from typing import Any, Iterator
from pathlib import Path 
from langextract import data_lib
from langextract.core import data
from langextract.core import exceptions

import requests
import argparse


def parse_code(code: str) -> dict:
    subject = (
        "cz" if code[0] == "C"
        else "math" if code[0] == "M"
        else "en" if code[0] == "A"
        else "de" if code[0] == "D"
        else None
    )

    grade = code[1]

    period = (
        "8" if grade == "5"
        else "6" if grade == "7"
        else "4" if grade == "9"
        else "diploma"
    )

    order = code[2]
    year = code[-4:]

    return {
        "subject": subject,
        "grade": grade,
        "order": order,
        "period": period,
        "year": year,
    }

class FailedFetchError(exceptions.InternalError):
  """Error raised when Dataset is empty or invalid."""

def fetch_markdown(url: str) -> str:
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return response.text
    except requests.RequestException as e:
        raise FailedFetchError(f"Failed to fetch markdown: {e}")        

def read_markdown_file(path: str) -> str:
  try:
    return Path(path).read_text(encoding="utf-8")
  except FileNotFoundError:
    raise FileNotFoundError(f"Markdown file not found: {path}")
    
  
class InvalidDatasetError(exceptions.LangExtractError):
  """Error raised when Dataset is empty or invalid."""

def convert_annotated_documents_to_json(annotated_documents: Iterator[data.AnnotatedDocument]) -> str:
  
  """Convert annotated documents to a JSON Lines file.

  Args:
    annotated_documents: Iterator over AnnotatedDocument objects to convert to json.

  Raises:
    InvalidDatasetError: If no documents are produced.
  """
 
  has_data = False
  doc_count = 0
  json_s = ""
    
  for adoc in annotated_documents:
    if not adoc.document_id:
        continue
    doc_dict = data_lib.annotated_document_to_dict(adoc)
    json_s += json.dumps(doc_dict, ensure_ascii=False) + '\n'
    has_data = True
    doc_count += 1

  if not has_data:
    raise InvalidDatasetError(f'No documents to convert')

  return json_s


parser = argparse.ArgumentParser(description="My command-line tool")
parser.add_argument("--code", "-c", dest="code", type=str, help="code")

args = parser.parse_args()

# 1. Define the prompt and extraction rules
prompt = textwrap.dedent("""\
Extract entities with its unit and quantity, using attributes to group related information.
Use exact text for extractions. Do not paraphrase or overlap entities.
Ignore extraction inside latex expression (enclosed withing '$' or '$$').

1. Extract entities in the order they appear in the text
2. Each entity must have a 'entity_group' attribute linking it to its unit and quantity
3. All details about a entity should share the same entity_group value""")

# 2. Provide a high-quality example to guide the model
examples = [
    lx.data.ExampleData(
        text="""\
            Farmář měl původně sedm krav. Každá z nich nadojila denně 15 litrů mléka.""",

    extractions=[
            lx.data.Extraction(
                extraction_class="quantity",
                extraction_text="sedm",
                attributes={"entity_group": "kráva"}
            ),
            lx.data.Extraction(
                extraction_class="entity",
                extraction_text="krav",
                attributes={"entity_group": "kráva"}
            ),
            lx.data.Extraction(
                extraction_class="quantity",
                extraction_text="15",
                attributes={"entity_group": "mléko"}
            ),
            lx.data.Extraction(
                extraction_class="unit",
                extraction_text="litrů",
                attributes={"entity_group": "mléko"}
            ),
            lx.data.Extraction(
                extraction_class="entity",
                extraction_text="mléka",
                attributes={"entity_group": "mléko"}
            ),        
        ]
    )
]
parsedCode = parse_code(args.code)
baseDomain = "https://raw.githubusercontent.com/rsamec/cermat/refs/heads/main"
baseUrl = f"{baseDomain}/public/{parsedCode.get("subject")}/{parsedCode.get("period")}/{args.code}/index.md"

# The input text to be processed
input_text = fetch_markdown(baseUrl)


# Run the extraction
result = lx.extract(
    text_or_documents=input_text,
    prompt_description=prompt,
    examples=examples,
    model_id="gemini-2.5-flash",
)

result_s = convert_annotated_documents_to_json([result])


sys.stdout.write(result_s)