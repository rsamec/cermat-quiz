import {b} from "../../baml_client/index";
import type {Resume} from "../../baml_client/types"

export async function Example(raw_resume: string): Resume {
  // BAML's internal parser guarantees ExtractResume
  // to be always return a Resume type
  const response = await b.ExtractResume(raw_resume);
  return response;
}

async function ExampleStream(raw_resume: string): Resume {
  const stream = b.stream.ExtractResume(raw_resume);
  for await (const msg of stream) {
    console.log(msg) // This will be a Partial<Resume> type
  }

  // This is guaranteed to be a Resume type.
  return await stream.get_final_response();
}
