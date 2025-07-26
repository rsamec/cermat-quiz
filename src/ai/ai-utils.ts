import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { toGeminiSchema } from '../lib/gemini-zod';

export type AIProvider = OpenAIProvider | GeminiAIProvider | GithubModelProvider;
export type OpenAIProvider = {
  kind: "openai",
  model: "o4-mini" | "o3"
}
export type GithubModelProvider = {
  kind: "github",
  model: "gpt-4o" | "o4-mini" | "o3"
}

export type GeminiAIProvider = {
  kind: "gemini",
  model: "gemini-2.5-flash"
}


interface AIWrapperOptions {
  openAIKey: string;
  geminiKey: string;
  githubKey: string;
}
interface CallAIOptions {
  model: string;
  prompt: [{role:"user" | "system" | "developer", content:string}];
}
interface SchemaCallAIOptions<T extends z.ZodRawShape> extends CallAIOptions {
  schema: z.ZodObject<T>;
  schemaName: string;
}

type AIResult<T> =
  | { success: true; data: T; raw: string }
  | { success: false; error: string; raw?: string };

export class AIWrapper {
  private openai: OpenAI;
  private githubai: OpenAI;
  private genai: GoogleGenAI;

  constructor({ openAIKey, geminiKey, githubKey }: AIWrapperOptions) {
    if (openAIKey != null) this.openai = new OpenAI({ apiKey: openAIKey });
    if (geminiKey != null) this.genai = new GoogleGenAI({ apiKey: geminiKey });
    if (githubKey != null) this.githubai = new OpenAI({ baseURL: "https://models.inference.ai.azure.com", apiKey: githubKey })
  }
  async callOpenAIEx<T extends z.ZodRawShape>(engine: OpenAI, options: SchemaCallAIOptions<T>): Promise<AIResult<T>> {
    const { prompt, schema, schemaName, model = "gpt-4" } = options;
    const response_format = zodResponseFormat(schema, schemaName);
    try {
      const chat = await engine.chat.completions.create({
        model,
        messages: prompt,
        response_format, 
        temperature: 1.,
        max_completion_tokens: 16000,
        top_p: 1.

      });

      const raw = chat.choices[0].message?.content ?? "";

      return this.parseJson<T>(raw);
    } catch (err: any) {
      return { success: false, error: err.message || "OpenAI error" };
    }
  }

  async rawCallOpenAIEx(engine: OpenAI, options: CallAIOptions): Promise<AIResult<string>> {
    const { prompt, model = "gpt-4" } = options;

    try {
      const chat = await engine.chat.completions.create({
        model,
        messages:prompt,
        temperature: 1.,
        max_completion_tokens: 16000,
        top_p: 1.

      });

      const raw = chat.choices[0].message?.content ?? "";

      return { success: true, data: raw, raw }
    } catch (err: any) {
      return { success: false, error: err.message || "OpenAI error" };
    }
  }



  async callGemini<T extends z.ZodRawShape>(options: SchemaCallAIOptions<T>): Promise<AIResult<T>> {
    const { prompt, schema, model = "gemini-pro" } = options;

    try {
      const request = {
        model,
        contents: prompt.map(d => d.content).join("\n"),
        config: {
          responseMimeType: "application/json",
          responseSchema: toGeminiSchema(schema)
        },
      };
      // console.log(request);
      const response = await this.genai.models.generateContent(request);
      // console.log(response);
      console.log(`Thoughts tokens: ${response.usageMetadata?.thoughtsTokenCount}`);
      console.log(`Output tokens: ${response.usageMetadata?.candidatesTokenCount}`);
      const raw = response.text;

      if (raw === undefined) {
        return { success: false, error: "No Gemini response.text" }
      }

      return this.parseJson<T>(raw);
    } catch (err: any) {
      return { success: false, error: err.message || "Gemini error" };
    }
  }
  async rawCallAI(provider: "openai" | "gemini" | "github", options: CallAIOptions): Promise<AIResult<string>> {
    if (provider === "gemini") {
      //return this.ra(options);
    }
    else if (provider === "openai") {
      return this.rawCallOpenAIEx(this.openai, options);
    }
    else if (provider === "github") {
      return this.rawCallOpenAIEx(this.githubai, options);
    }
    else {
      throw `Unknown API provider ${provider}`;
    }
  }
  async callAI<T extends z.ZodRawShape>(provider: "openai" | "gemini" | "github", options: SchemaCallAIOptions<T>): Promise<AIResult<T>> {
    if (provider === "gemini") {
      return this.callGemini(options);
    }
    else if (provider === "openai") {
      return this.callOpenAIEx(this.openai, options);
    }
    else if (provider === "github") {
      return this.callOpenAIEx(this.githubai, options);
    }
    else {
      throw `Unknown API provider ${provider}`;
    }
  }

  private parseJson<T>(raw: string): AIResult<T> {
    try {
      const json = JSON.parse(raw);
      return { success: true, data: json, raw };
    } catch {
      console.error("Failed to parse JSON:", raw);
      return { success: false, error: "Failed to parse JSON", raw };
    }
  }
}

//export OPENAI_API_KEY=
//export GEMINI_API_KEY=
//export GITHUB_TOKEN=
export const client = new AIWrapper({
  openAIKey: process.env.OPENAI_API_KEY,
  geminiKey: process.env.GEMINI_API_KEY,
  githubKey: process.env.GITHUB_TOKEN,
})
