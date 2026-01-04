import { z } from "zod";

export const StepSchema = z.object({
  label: z.string().describe("Short label describing the step"),
  calculation: z.string().optional().describe("Mathematical calculation performed in this step"),
  analysis: z.string().describe("Explanation or reasoning for the calculation"),
  result: z.string().describe("Final conclusion or outcome of the step"),
});

export const TaskSchema = z.object({
  id: z.string().describe("Unique task identifier (e.g. '5.1')."),
  title: z.string().describe("Human-readable task title"),
  context: z.string().describe("Key points for problem solving"),
  steps: z.array(StepSchema).describe("Ordered list of solution steps"),
});

export const ExamSchema = z.object({
  id: z.string(),
  title: z.string(),
  tasks: z.array(TaskSchema).describe(`The format is markdown text. Each task is identified by markdown headings. Some task can have sub tasks.
        - # heading is root task - task id is idenfied by format # {number}
        - ## heading is sub task - sub task id is idenfied by format ## {number}.{number}
      Important: The task without sub tasks should have exactly only one task, where id of the task is the same with the exam id.`),
});

export const ModelResponse = ExamSchema
