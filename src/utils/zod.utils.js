import { z } from "zod";
import { convertTree, getAllLeafsWithAncestors } from './parse-utils.js';

const optionsEnum = z.enum(["A", "B", "C", "D", "E", "F"]);

export function quizSchema(quizMetadata) {
  const questions = getAllLeafsWithAncestors(convertTree(quizMetadata));
  // const answerWithExplanation = (d:LeafWithAncestors<Answer<any>>) => z.object({
  //   final_answer: convertToZodType(d.leaf.data.node as any),
  //   explanation: z.string().describe("Vysvětli konečnou odpověď na otázku. Použij markdown formát.")
  // });


  const schema = Object.fromEntries(questions.map(d => [toKey(d.leaf.data.id), convertToZodType(d.leaf.data.node)]))
  return z.object(schema);
}
export function quizUISchema(quizMetadata) {
  const questions = getAllLeafsWithAncestors(convertTree(quizMetadata));

  const uiSchema = {
    "type": "VerticalLayout",
    "elements": questions.map(d => ({
      type: "Control",
      label: d.leaf.data.id,
      scope: `#/properties/${toKey(d.leaf.data.id)}`
    }))
  }
  return uiSchema;
}
export function quizUISchema2(quizMetadata) {
  const questions = getAllLeafsWithAncestors(convertTree(quizMetadata));

  const uiSchema = {
    "ui:order": questions.map(d => toKey(d.leaf.data.id)),
  }
  return uiSchema;
}

function toKey(id){
  return `${id.toString()}`;
}

function convertToZodType(node) {
  switch (node.verifyBy.kind) {
    case 'equalRatio':
      return z.string().describe("use format {number}:{number}")
    case 'equalLatexExpression':
      return z.string().describe(`use latex formating`)
    case 'equalMathEquation':
    case 'equalMathExpression':
      return z.string().describe(`do not use latex formating, use simple math string, for fraction use slash symbol, for powers use caret symbol`)
    case 'equal':
      return typeof node.verifyBy.args == 'number'
        ? z.number()
        : typeof node.verifyBy.args == "string"
          ? z.string()
          : z.object(Object.fromEntries(Object.keys(node.verifyBy.args).map(key => [key, typeof node.verifyBy.args[key] == "number" ? z.number() :z.string()])));
    case 'matchObjectValues':
      return z.object(Object.fromEntries(Object.keys(node.verifyBy.args).map(key => [key, z.string()])));
    case 'equalNumberCollection':
      return z.array(z.number()).max(node.verifyBy.args.length);
    case 'equalStringCollection':
      return z.array(z.string()).max(node.verifyBy.args.length);
    case 'equalSortedOptions':
      return z.array(optionsEnum, { description: "sort options"}).min(6).max(6);
    case 'equalOption':
      return typeof node.verifyBy.args == 'boolean' ? z.boolean() : optionsEnum;
    case 'selfEvaluate':
      return z.enum(node.verifyBy.args.options.map(d => d.value));
    default:
      return z.string();
  }
}