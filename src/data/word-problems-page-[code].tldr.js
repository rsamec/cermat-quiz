import { parseArgs } from "node:util";
import path from 'path';
import wordProblems from '../math/word-problems.js';
import { createBookmarks, deductionTreeShapes, createFrame, createShapeId, convertToShapes } from "../ai/tldraw.js";
import { mapShapes, mapBindings, mapAssets, serialize, createPage, mdToRichText } from "../ai/tldraw-store.js";
import { parseQuiz } from '../utils/quiz-parser.js';
import { baseDomainPublic, parseCode, normalizeImageUrlsToAbsoluteUrls, text, normalizeLatex, formatCodeAlt } from '../utils/quiz-string-utils.js';
import { generateAIMessages, wordProblemGroupById } from "../utils/deduce-utils.js";
import { readJsonFromFile, fileExists } from '../utils/file.utils.js';


const colorPallete = [
  'red',
  'light-red',
  'green',
  'light-green',
  'blue',
  'light-blue',
  'orange',
  'yellow',
  'violet',
  'light-violet',
]

const {
  values: { code }
} = parseArgs({
  options: { code: { type: "string" } }
});


//QUESTIONS DATA
const d = parseCode(code);
const baseUrl = `${baseDomainPublic}/${d.subject}/${d.period}/${code}`
const content = await text(`${baseUrl}/index.md`);


const rawContent = normalizeImageUrlsToAbsoluteUrls(content, [baseUrl])
const quiz = parseQuiz(rawContent);
const ids = quiz.questions.map(d => d.id);

//AI DATA
let aiCategoriesData;
const aiCategoriesDataPaht = path.resolve(`./src/data/quiz-categories-gemini-2.5-flash.json`);
if (await fileExists(aiCategoriesDataPaht)) {
  aiCategoriesData = await readJsonFromFile(aiCategoriesDataPaht);
}
const aiCatogories = ((aiCategoriesData[code]?.questions ?? []).reduce((out, obj) => {
  out[obj.id] = obj;
  return out
}, {}));

let aiKeyPointsShapeData;
const aiAnswersDataPath = path.resolve(`./src/data/word-problems-ai-working-sheet-${code}-o4-mini-shapes.json`);
if (await fileExists(aiAnswersDataPath)) {
  aiKeyPointsShapeData = await readJsonFromFile(aiAnswersDataPath);
}
const aiKeyPoints = (aiKeyPointsShapeData ?? {});

let aiStepsData;
const aiStepsDataPath = path.resolve(`./src/data/word-problems-ai-key-points-${code}-o4-mini.json`);
if (await fileExists(aiStepsDataPath)) {
  aiStepsData = await readJsonFromFile(aiStepsDataPath);
}
const aiSteps = (aiStepsData ?? {});

//WORD PROBLEMS DATA
const wordProblem = wordProblems[code] ?? {};


//SHAPES
const usedQuestionIds = []
const records = [];

const newPage = createPage({
  name: code
})
records.push(newPage)


//prepare groups
const wordProblemGroups = wordProblemGroupById(wordProblem);

const DEFAULT_BOOKMARK_WIDTH = 300;
const DEFAULT_BOOKMARK_HEIGHT = 101;
const DEFAULT_BREAK_HEIGHT = 1000;
let cumulativeY = DEFAULT_BREAK_HEIGHT;

//QUIZ SHAPES
const quizBookmarks = [
  { title: "Tisk", description: "Tisk", url: `https://www.cermatdata.cz/print-${code}` },
  { title: "Test", description: "Test", url: `https://www.cermatdata.cz/form-${code}` },
].map(({ title, description, url }, i) => ({
  shapeId: createShapeId(),
  type: "bookmark",
  x: (i * DEFAULT_BOOKMARK_WIDTH) + 20,
  y: -DEFAULT_BOOKMARK_HEIGHT,
  height: DEFAULT_BOOKMARK_HEIGHT,
  width: DEFAULT_BOOKMARK_WIDTH,
  url,
  title,
  description,
  favicon: "https://www.eforms.cz/favicon.ico"
}));

const quizText = {
  type: "text",
  shapeId: createShapeId(),
  text: formatCodeAlt(code),
  scale: 20,
  x: 0,
  y: 0,
}

const quizShapes = convertToShapes([quizText].concat(quizBookmarks))
const shapesToAdd = [...quizShapes.shapes.map(d => ({ ...d, parentId: newPage.id }))]
const assetsToAdd = [...quizShapes.assets];
const bindingsToAdd = []

//LOOP WORD PROBLEMS
const resultJson = Object.entries(wordProblem).sort(([f], [s]) => f.localeCompare(s, 'en', { numeric: true }))
  .reduce((out, [key, value], index) => {

    const id = parseInt(key.split(".")[0]);

    const deduceTreeResponse = deductionTreeShapes(value.deductionTree, `Řešení ${key}`);
    const { data, width, height } = deduceTreeResponse;

    const currentColor = colorPallete[(usedQuestionIds.length + 1) % colorPallete.length];

    if (!usedQuestionIds.includes(id)) {
      usedQuestionIds.push(id)
      cumulativeY += DEFAULT_BREAK_HEIGHT;

      // PROMPTS SHAPES
      const aiPrompts = generateAIMessages({
        template: quiz.content([id], { ids, render: 'content' }),
        deductionTrees: wordProblemGroups[id].map(d => d.deductionTrees) ?? []
      });

      const allPrompts = [
        { title: "Klíčové myšlenky", description: "Hlavní myšlenky řešení", prompt: aiPrompts.generateImportantPoints },
        { title: "Krok za krokem", description: "Podrobné vysvětlení řešení úlohy krok za krokem", prompt: aiPrompts.explainSolution },
        { title: "Generalizace", description: "Generalizace úlohy", prompt: aiPrompts.generalization },
        { title: "Obdobné úlohy", description: "Generuj obdobné úlohy", prompt: aiPrompts.generateMoreQuizes },
        { title: "Pracovní list", description: "Generuj pracovní list", prompt: aiPrompts.generateSubQuizes }
      ]
      const bookmarkFrameId = createShapeId();
      const bookmarkFrame = {
        ...
        createFrame({
          id: bookmarkFrameId,
          name: `ChatGPT prompts - úloha ${id}`,
          color: currentColor,
          h: 110,
          w: DEFAULT_BOOKMARK_WIDTH * allPrompts.length + 20,
        }),
        x: 1000,
        y: cumulativeY - 300,
        parentId: newPage.id
      }
      shapesToAdd.push(bookmarkFrame)

      const bookmarksToAdd = createBookmarks(allPrompts.map(({ title, description, prompt }, i) => ({
        shapeId: createShapeId(),
        type: "bookmark",
        x: 5 + (i * DEFAULT_BOOKMARK_WIDTH),
        y: 5,
        height: DEFAULT_BOOKMARK_HEIGHT,
        width: DEFAULT_BOOKMARK_WIDTH,
        url: `https://chat.openai.com/?q=${encodeURIComponent(prompt)}`,
        title,
        description,
        favicon: "https://cdn.oaistatic.com/assets/favicon-eex17e9e.ico"
      })));
      shapesToAdd.push(...bookmarksToAdd.shapes.map(d => ({ ...d, parentId: bookmarkFrameId })))
      assetsToAdd.push(...bookmarksToAdd.assets);


      if (aiKeyPoints[id] != null) {

        const newFrameId = createShapeId();
        const newFrame = {
          ...
          createFrame({
            id: newFrameId,
            name: `Hlavní myšlenky řešení ${id}`,
            color: currentColor,
            h: 500,
            w: 1000,
          }),
          x: -1100,
          y: cumulativeY + 400,
          parentId: newPage.id
        }

        const stepsToAdd = aiKeyPoints[id].events.filter(d => d.type == "create").map(d => ({ ...d.shape, shapeId: `shape:${d.shape.shapeId}` }));


        const convertedStepsToAdd = convertToShapes(stepsToAdd);
        // shapesToAdd.push(newFrame)
        // shapesToAdd.push(...convertedStepsToAdd.shapes.map(d => ({ ...d, parentId: newFrameId })))
        // bindingsToAdd.push(...convertedStepsToAdd.bindings);

      }

      // QUESTION SHAPE

      const inputMarkdown = quiz.content([id], { ids, render: 'content' });
      const { extractedImages, richText } = mdToRichText(inputMarkdown);

      const bookmarksToImage = extractedImages.map(d => ({
        shapeId: createShapeId(),
        type: "bookmark",
        x: -800,
        y: cumulativeY,
        width: 600,
        url: d.attrs.src,
        image: d.attrs.src,
        title: d.attrs.title,
        description: d.attrs.alt,
        favicon: "https://github.githubassets.com/favicons/favicon.png"
      }))
      const rectangleShape = {
        type: "rectangle",
        shapeId: createShapeId(),
        text: richText,
        fill: 'pattern',
        align: 'start',
        verticalAlign: 'start',
        width: 900,
        height,
        color: currentColor,
        x: 0,
        y: cumulativeY,
      }
      const descriptionShapes = [];
      if (aiCatogories[id] != null) {
        const newDescription = {
          shapeId: createShapeId(),
          type: "cloud",
          width: 600,
          height: 300,
          fill: 'tint',
          color: currentColor,
          x: 0,
          y: cumulativeY - 600,
          text: {
            "type": "doc",
            "content": [
              {
                "type": "paragraph",
                "content": [
                  {
                    "type": "text",
                    "marks": [
                      {
                        "type": "bold"
                      }
                    ],
                    "text": aiCatogories[id].name
                  }
                ]
              },
              {
                "type": "paragraph",
              },
              {
                "type": "paragraph",
                "content": [
                  {
                    "type": "text",
                    "marks": [
                      {
                        "type": "italic"
                      }
                    ],
                    "text": aiCatogories[id].summary
                  }
                ]
              }
            ]
          }
        };
        descriptionShapes.push(newDescription)

        const descriptionArrow = {
          type: "arrow",
          shapeId: createShapeId(),
          fromId: rectangleShape.shapeId,
          toId: newDescription.shapeId,
          text: 'Shrnutí',
          x2: 0,
          y2: 0,
          x1: 0,
          y1: 0
        }
        descriptionShapes.push(descriptionArrow)
      }
      const arrows = bookmarksToImage.map(d => ({
        type: "arrow",
        shapeId: createShapeId(),
        fromId: d.shapeId,
        toId: rectangleShape.shapeId,
        x2: 0,
        y2: 0,
        x1: 0,
        y1: 0
      }));

      const questionShapesToAdd = convertToShapes([rectangleShape].concat(descriptionShapes).concat(bookmarksToImage).concat(arrows));

      // const questionShapeToAdd = {
      //   type: "markdown",
      //   id: createShapeId(),
      //   props: {
      //     color: currentColor,
      //     size: 'm',
      //     h: height,
      //     w: 1000,
      //     markdown: inputMarkdown
      //   },
      //   x: -1000,
      //   y: cumulativeY,
      //   parentId: newPage.id,
      //   meta: {
      //     steps: jsonToMarkdownChat(value.deductionTree).join("")
      //   }
      // }

      shapesToAdd.push(...questionShapesToAdd.shapes.map(d => ({ ...d, parentId: newPage.id })));
      bindingsToAdd.push(...questionShapesToAdd.bindings);
      assetsToAdd.push(...questionShapesToAdd.assets);


      const aiStep = aiSteps[id];
      if (aiStep != null) {
        const stepsShape = {
          type: "markdown",
          id: createShapeId(),
          props: {
            size: 'm',
            color: currentColor,
            h: height,
            w: 1000,
            markdown: normalizeLatex(aiStep)
          },
          x: width,
          y: cumulativeY,
          parentId: newPage.id,
        }
        //shapesToAdd.push(stepsShape);

      }

    }

    shapesToAdd.push(...data.shapes.map((d, i) => ({
      ...d,
      ...(i === 0 && { y: (cumulativeY), x: 1000, parentId: newPage.id }),
    })));

    bindingsToAdd.push(...data.bindings);
    assetsToAdd.push(...data.assets);

    out.push(...mapShapes(shapesToAdd, newPage.index));
    out.push(...mapBindings(bindingsToAdd));
    out.push(...mapAssets(assetsToAdd));

    cumulativeY += height + 60;
    return out;
  }, records)


process.stdout.write(serialize(resultJson));

