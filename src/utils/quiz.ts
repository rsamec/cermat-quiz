import { createModel, Models } from '@rematch/core'
import { TreeNode, getAllLeafsWithAncestors } from '../utils/parse-utils.js';
import { getVerifyFunction, ValidationFunctionSpec } from '../utils/assert.js';

export interface RootModel extends Models<RootModel> {
  results: typeof results
}
 


export type SumCompute = {
  kind: 'sum'
}
export type GroupCompute = ComputeFunctionArgs<{ points: number, min: number }[]> & {
  kind: 'group'
}
export type ComputeFunctionSpec = SumCompute | GroupCompute

export type ComputeFunctionArgs<T> = { args: T }


export interface AnswerMetadata<T> {
  verifyBy: ValidationFunctionSpec<T>
  points?: number
}

export interface AnswerInfo {
  code: string,
  maxPoints: number
  questions: {
    opened: number,
    closed: number,
  }
}
export interface AnswerGroupMetadata<T> {
  computeBy?: ComputeFunctionSpec,
  info?: AnswerInfo
  inline?: boolean
}
export type MixedChildren<T> = { [K in keyof T]: T[K] extends AnswerGroup<any> ? T[K] : AnswerMetadata<any> };
export interface AnswerGroup<T> {
  children: MixedChildren<T>
  metadata?: AnswerGroupMetadata<T>
}
export type AnswerNode<T> = AnswerGroup<T> | AnswerMetadata<T>;
export type Answer<T> = AnswerTreeNode<AnswerNode<T>>
export type AnswerMetadataTreeNode<T> = AnswerTreeNode<AnswerMetadata<T>>
export type AnswerGroupTreeNode<T> = AnswerTreeNode<AnswerGroup<T>>
export interface AnswerTreeNode<T> {
  id: string
  node: T
}

export interface QuizState {
  tree?: TreeNode<Answer<any>>
  questions: AnswerMetadataTreeNode<any>[]
  answers: Record<string, any>;
  corrections: Record<string, boolean>;
  totalPoints: number;
  maxTotalPoints: number;
}

const initState: QuizState = {
  questions: [],
  answers: {},
  corrections: {},
  totalPoints: 0,
  maxTotalPoints: 0
}



const results = createModel<RootModel>()({
  state: { ...initState },
  reducers: {
    init(state, { tree, answers }: { tree: TreeNode<Answer<any>>, answers: Record<string, any> }) {
      const questions = getAllLeafsWithAncestors(tree).map((d, i) => d.leaf.data as AnswerMetadataTreeNode<any>)
      const keys = Object.keys(answers);
      const corrections = calculateCorrections(questions.filter(d => keys.indexOf(d.id) != -1), answers);

      return {
        ...initState,
        questions,
        tree,
        answers,
        corrections,
        totalPoints: calculateTotalPoints({ tree, corrections, answers }),
        maxTotalPoints: calculateMaxTotalPoints(tree)
      }
    },
    submitQuizAnswer(state, { questionId, answer }: { questionId: string; answer: string }) {
      const question = state.questions.find(d => d.id === questionId);
      if (question == null) {
        throw `Question ${questionId} does not exist.`;
      }
      const answers = {
        ...state.answers,
        [questionId]: answer,
      }
      const corrections = {
        ...state.corrections,
        [questionId]: verifyQuestion(question, answer)
      }
      return {
        ...state,
        answers,
        corrections,
        totalPoints: calculateTotalPoints({ tree: state.tree, corrections, answers })
      };
    },
    submitQuiz(state, answers: Record<string, any>) {
      const corrections = calculateCorrections(state.questions, answers);
      return {
        ...state,
        answers,
        corrections,
        totalPoints: calculateTotalPoints({ tree: state.tree, corrections, answers }),
      };
    },
    resetQuizAnswers(state) {
      const answers = {};
      const corrections = {}
      return {
        ...state,
        answers,
        corrections,
        totalPoints: calculateTotalPoints({ tree: state.tree, corrections, answers }),

      }
    }
  },
  selectors: (slice) => ({
    totalAnswers() {
      return slice(state => Object.keys(state.answers).length)
    },
    points() {
      return slice(state => state.tree?.children?.reduce((out, d) => {
        out[d.data.id] = {
          v: calculateTotalPoints({ tree: d, corrections: state.corrections, answers: state.answers }),
          max: calculateMaxTotalPoints(d)
        }
        return out;
      }, {} as Record<string, { v: number, max: number }>))
    },
  }),
});

export const models: RootModel = { results }



// Helper functions
const calculateCorrections = (questions: AnswerMetadataTreeNode<any>[], answers: Record<string, any>) => {
  const corrections: Record<string, boolean> = {};

  questions.forEach((question) => {
    corrections[question.id] = verifyQuestion(question, answers[question.id])
  });

  return corrections;
};

const verifyQuestion = (question: AnswerMetadataTreeNode<any>, answer: string) => {
  return verifyQuestionResult(question.node.verifyBy, answer) == null
}
const verifyQuestionResult = (verifyBy: ValidationFunctionSpec<any>, answer: string) => {
  const validator = getVerifyFunction(verifyBy);
  return validator(answer);
}
const calculatePointsByErrorCount = (d: AnswerMetadataTreeNode<any>, answers: Record<string, any>) => {
  const error = verifyQuestionResult(d.node.verifyBy, answers[d.id]);
  if (error != null) {
    return error.errorCount != null ? Math.max(Math.max((d.node.points ?? 0) - error.errorCount, 0)) : 0;
  }
  return d.node.points ?? 0;
}


const calculateTotalPoints = ({ tree, corrections, answers }: { tree?: TreeNode<Answer<any>>, corrections: Record<string, boolean>, answers: Record<string, any> }) => {
  let totalPoints = 0;
  if (tree == null) return totalPoints;

  const calculateSum = (children: AnswerMetadataTreeNode<any>[]) => children.reduce((out, d) => {
    out += d.node.points == null && d.node.verifyBy.kind == "selfEvaluate"
      ? (answers[d.id]?.value ?? 0)
      : !corrections[d.id] && d.node.verifyBy.kind == "equalStringCollection" || d.node.verifyBy.kind == "equalNumberCollection"
        ? calculatePointsByErrorCount(d, answers)
        : corrections[d.id] ? (d.node.points ?? 0) : 0
    return out;
  }, 0)

  const calculateCustom = (computBy: GroupCompute, children: AnswerMetadataTreeNode<any>[]) => {
    const successCount = children.map(d => corrections[d.id]).filter(d => d).length;
    const points = computBy.args.filter(d => d.min <= successCount).map(d => d.points);
    return points.length > 0 ? Math.max(...points) : 0
  }

  totalPoints = calculatePoints(tree, (computeBy, leafs) => computeBy != null && computeBy.kind == "group"
    ? calculateCustom(computeBy, leafs)
    : calculateSum(leafs))

  return totalPoints;

};

function calculateMaxTotalPoints<T>(tree: TreeNode<AnswerTreeNode<T>>) {
  let totalPoints = 0;
  if (tree == null) return totalPoints;

  const calculateSum = (children: AnswerMetadataTreeNode<T>[]) => children.reduce((out, d) => {
    const verifyBy = d.node.verifyBy;

    const maxPoints = verifyBy.kind == "selfEvaluate" ?
      verifyBy.args.options.reduce((out, d) => out = out > d.value ? out : d.value, 0) :
      d.node.points ?? 0
    out += maxPoints;
    return out;
  }, 0)

  const calculate = (computeBy: ComputeFunctionSpec | null, leafs: AnswerMetadataTreeNode<any>[]) => {

    const res = computeBy != null && computeBy.kind == "group" ?
      computeBy.args.reduce((out, d) => out = out > d.points ? out : d.points, 0)
      : calculateSum(leafs);
    return res;
  }

  totalPoints = calculatePoints(tree, calculate)

  return totalPoints;

};

export function calculatePoints<T>(tree: TreeNode<AnswerTreeNode<T>>,
  calculate: (computeBy: ComputeFunctionSpec | null, leafs: AnswerMetadataTreeNode<any>[]) => number) {

  const traverse = (node: TreeNode<AnswerTreeNode<T>>, leafs: AnswerMetadataTreeNode<T>[], level: number = 0) => {
    let total = 0;

    // Check if the current node is a leaf (no children)
    if (!node.children || node.children.length === 0) {
      leafs.push(node.data as AnswerMetadataTreeNode<T>);
      return level === 0 ? calculate(null, leafs) : 0;
    }
    else {
      const group = node.data as AnswerGroupTreeNode<T>;
      //clear leafs for each composite node
      leafs = []
      // Recursively calculate total points for each child node						
      for (const childNode of node.children) {
        const points = traverse(childNode, leafs, level + 1);
        total += points;
        //if (level == 0) console.log(childNode.data.id, points)
      }
      //points for leafs    
      //if (level == 0) console.log(leafs.map(d => d.id))
      total += leafs.length > 0 ? calculate(group.node.metadata?.computeBy!, leafs) : 0;
    }
    return total
  }

  const totalPoints = traverse(tree, [])
  return totalPoints;
}