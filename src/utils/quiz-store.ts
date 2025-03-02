import { convertTree, getAllLeafsWithAncestors } from './parse-utils.js';
import { getVerifyFunction } from './assert.js';

type Listener<T> = (state: T) => void;

class BehaviorSubject<T> {
  private state: T;
  private listeners: Listener<T>[] = [];

  constructor(initialState: T) {
    this.state = initialState;
  }

  getValue(): T {
    return this.state;
  }
  get value() : T {
    return this.getValue();
  }

  next(newState: T): void {
    this.state = newState;
    this.listeners.forEach((listener) => listener(this.state));
  }

  subscribe(listener: Listener<T>): () => void {
    this.listeners.push(listener);
    listener(this.state); // Emit the initial state
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  asObservable() {
    return {
      subscribe: this.subscribe.bind(this)
    };
  }
}

type ValidationFunctionSpec<T> = any;
type SumCompute = {
  kind: 'sum'
}
type GroupCompute = ComputeFunctionArgs<{ points: number, min: number }[]> & {
  kind: 'group'
}
type ComputeFunctionSpec = SumCompute | GroupCompute
type ComputeFunctionArgs<T> = { args: T }

export type TreeNode = any;
export type AnswerMetadataTreeNode = any;

export interface QuizState {
  tree: TreeNode
  questions: AnswerMetadataTreeNode
  answers: Record<string, any>;
  corrections: Record<string, boolean>;
  totalPoints: number;
  maxTotalPoints: number;
}
export type QuestionId = string
export type Answers = Record<QuestionId, any>

export class QuizStore {
  
  private state$ = new BehaviorSubject<QuizState>({
    tree: {},
    questions: [],
    answers: {},
    corrections: {},
    totalPoints: 0,
    maxTotalPoints: 0
  });
  
  constructor({ metadata, answers }: { metadata: any, answers?: Answers }) {
    answers = answers ?? {}
    const tree = convertTree(metadata);
    const questions = getAllLeafsWithAncestors(tree).map((d, i) => d.leaf.data as AnswerMetadataTreeNode)
    const keys = Object.keys(answers);
    const corrections = calculateCorrections(questions.filter(d => keys.indexOf(d.id) != -1), answers);

    this.updateState({
      questions,
      tree,
      answers,
      corrections,
      totalPoints: calculateTotalPoints({ tree, corrections, answers }),
      maxTotalPoints: calculateMaxTotalPoints(tree)
    })
  } 

  getState$() {
    return this.state$.asObservable();
  }
  getState(): QuizState {
    return this.state$.value;
  }

  private updateState(partialState: Partial<QuizState>) {
    this.state$.next({ ...this.state$.getValue(), ...partialState });
  }

  submitQuizAnswer({ questionId, answer }: { questionId: QuestionId; answer: string }) {
    const state = this.state$.getValue();
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
    this.updateState({
      answers,
      corrections,
      totalPoints: calculateTotalPoints({ tree: state.tree, corrections, answers })
    });
  }
  submitQuiz(answers: Answers) {
    const state = this.state$.getValue();
    const corrections = calculateCorrections(state.questions, answers);
    this.updateState({
      answers,
      corrections,
      totalPoints: calculateTotalPoints({ tree: state.tree, corrections, answers }),
    })
  }
  resetQuizAnswers() {
    const state = this.state$.getValue();
    const answers = {};
    const corrections = {}
    this.updateState({
      answers,
      corrections,
      totalPoints: calculateTotalPoints({ tree: state.tree, corrections, answers }),
    })
  }


  selectors(state: QuizState) {
    return {
      totalAnswers: this.totalAnswers()(state),
      maxTotalAnswers: this.maxTotalAnswers()(state),
      points: this.points()(state),
    }
  }
  private totalAnswers() {
    return (state: QuizState) => Object.keys(state?.answers ?? {}).length;
  }
  private maxTotalAnswers() {
    return (state:QuizState)  => state != null ? state.questions.length : 0;
  }
  private points() {
    return (state:QuizState) => state.tree?.children?.reduce((out, d) => {
      out[d.data.id] = {
        v: calculateTotalPoints({ tree: d, corrections: state.corrections, answers: state.answers }),
        max: calculateMaxTotalPoints(d)
      }
      return out;
    }, {} as Record<string, { v: number, max: number }>)
  }

  private slice<T>(selector: (state: QuizState) => T): T {
    return selector(this.state$.getValue())
  }
}

// Helper functions
const calculateCorrections = (questions: AnswerMetadataTreeNode[], answers: Record<string, any>) => {
  const corrections: Record<string, boolean> = {};

  questions.forEach((question) => {
    corrections[question.id] = verifyQuestion(question, answers[question.id])
  });

  return corrections;
};

const verifyQuestion = (question: AnswerMetadataTreeNode, answer: string) => {
  return verifyQuestionResult(question.node.verifyBy, answer) == null
}
const verifyQuestionResult = (verifyBy: ValidationFunctionSpec<any>, answer: any) => {
  const validator = getVerifyFunction(verifyBy);
  return validator(answer);
}
const calculatePointsByErrorCount = (d: AnswerMetadataTreeNode, answers: Record<string, any>) => {
  const error = verifyQuestionResult(d.node.verifyBy, answers[d.id]);
  if (error != null) {
    return error.errorCount != null ? Math.max(Math.max((d.node.points ?? 0) - error.errorCount, 0)) : 0;
  }
  return d.node.points ?? 0;
}


const calculateTotalPoints = ({ tree, corrections, answers }: { tree?: TreeNode, corrections: Record<string, boolean>, answers: Record<string, any> }) => {
  let totalPoints = 0;
  if (tree == null) return totalPoints;

  const calculateSum = (children: AnswerMetadataTreeNode[]) => children.reduce((out, d) => {
    out += d.node.points == null && d.node.verifyBy.kind == "selfEvaluate"
      ? (answers[d.id]?.value ?? 0)
      : !corrections[d.id] && d.node.verifyBy.kind == "equalStringCollection" || d.node.verifyBy.kind == "equalNumberCollection"
        ? calculatePointsByErrorCount(d, answers)
        : corrections[d.id] ? (d.node.points ?? 0) : 0
    return out;
  }, 0)

  const calculateCustom = (computBy: GroupCompute, children: AnswerMetadataTreeNode[]) => {
    const successCount = children.map(d => corrections[d.id]).filter(d => d).length;
    const points = computBy.args.filter(d => d.min <= successCount).map(d => d.points);
    return points.length > 0 ? Math.max(...points) : 0
  }

  totalPoints = calculatePoints(tree, (computeBy, leafs) => computeBy != null && computeBy.kind == "group"
    ? calculateCustom(computeBy, leafs)
    : calculateSum(leafs))

  return totalPoints;

};

function calculateMaxTotalPoints<T>(tree: TreeNode) {
  let totalPoints = 0;
  if (tree == null) return totalPoints;

  const calculateSum = (children: AnswerMetadataTreeNode[]) => children.reduce((out, d) => {
    const verifyBy = d.node.verifyBy;

    const maxPoints = verifyBy.kind == "selfEvaluate" ?
      verifyBy.args.options.reduce((out, d) => out = out > d.value ? out : d.value, 0) :
      d.node.points ?? 0
    out += maxPoints;
    return out;
  }, 0)

  const calculate = (computeBy: ComputeFunctionSpec | null, leafs: AnswerMetadataTreeNode[]) => {

    const res = computeBy != null && computeBy.kind == "group" ?
      computeBy.args.reduce((out, d) => out = out > d.points ? out : d.points, 0)
      : calculateSum(leafs);
    return res;
  }

  totalPoints = calculatePoints(tree, calculate)

  return totalPoints;

};

function calculatePoints<T>(tree: TreeNode,
  calculate: (computeBy: ComputeFunctionSpec | null, leafs: AnswerMetadataTreeNode[]) => number) {

  const traverse = (node: TreeNode, leafs: AnswerMetadataTreeNode[], level: number = 0) => {
    let total = 0;

    // Check if the current node is a leaf (no children)
    if (!node.children || node.children.length === 0) {
      leafs.push(node.data as AnswerMetadataTreeNode);
      return level === 0 ? calculate(null, leafs) : 0;
    }
    else {
      const group = node.data;
      //clear leafs for each composite node
      leafs = []
      // Recursively calculate total points for each child node
      for (const childNode of node.children) {
        const points = traverse(childNode, leafs, level + 1);
        total += points;
      }
      //points for leafs    
      total += leafs.length > 0 ? calculate(group.node.metadata?.computeBy!, leafs) : 0;
    }
    return total
  }

  const totalPoints = traverse(tree, [])
  return totalPoints;
}