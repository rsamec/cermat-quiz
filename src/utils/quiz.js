import { createModel } from '@rematch/core';
import { getAllLeafsWithAncestors } from '../utils/parse-utils.js';
import { getVerifyFunction } from '../utils/assert.js';
const initState = {
    questions: [],
    answers: {},
    corrections: {},
    totalPoints: 0,
    maxTotalPoints: 0
};
const results = createModel()({
    state: { ...initState },
    reducers: {
        init(state, { tree, answers }) {
            const questions = getAllLeafsWithAncestors(tree).map((d, i) => d.leaf.data);
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
            };
        },
        submitQuizAnswer(state, { questionId, answer }) {
            const question = state.questions.find(d => d.id === questionId);
            if (question == null) {
                throw `Question ${questionId} does not exist.`;
            }
            const answers = {
                ...state.answers,
                [questionId]: answer,
            };
            const corrections = {
                ...state.corrections,
                [questionId]: verifyQuestion(question, answer)
            };
            return {
                ...state,
                answers,
                corrections,
                totalPoints: calculateTotalPoints({ tree: state.tree, corrections, answers })
            };
        },
        submitQuiz(state, answers) {
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
            const corrections = {};
            return {
                ...state,
                answers,
                corrections,
                totalPoints: calculateTotalPoints({ tree: state.tree, corrections, answers }),
            };
        }
    },
    selectors: (slice) => ({
        totalAnswers() {
            return slice(state => Object.keys(state.answers).length);
        },
        points() {
            return slice(state => state.tree?.children?.reduce((out, d) => {
                out[d.data.id] = {
                    v: calculateTotalPoints({ tree: d, corrections: state.corrections, answers: state.answers }),
                    max: calculateMaxTotalPoints(d)
                };
                return out;
            }, {}));
        },
    }),
});
export const models = { results };
// Helper functions
const calculateCorrections = (questions, answers) => {
    const corrections = {};
    questions.forEach((question) => {
        corrections[question.id] = verifyQuestion(question, answers[question.id]);
    });
    return corrections;
};
const verifyQuestion = (question, answer) => {
    return verifyQuestionResult(question.node.verifyBy, answer) == null;
};
const verifyQuestionResult = (verifyBy, answer) => {
    const validator = getVerifyFunction(verifyBy);
    return validator(answer);
};
const calculatePointsByErrorCount = (d, answers) => {
    const error = verifyQuestionResult(d.node.verifyBy, answers[d.id]);
    if (error != null) {
        return error.errorCount != null ? Math.max(Math.max((d.node.points ?? 0) - error.errorCount, 0)) : 0;
    }
    return d.node.points ?? 0;
};
const calculateTotalPoints = ({ tree, corrections, answers }) => {
    let totalPoints = 0;
    if (tree == null)
        return totalPoints;
    const calculateSum = (children) => children.reduce((out, d) => {
        out += d.node.points == null && d.node.verifyBy.kind == "selfEvaluate"
            ? (answers[d.id]?.value ?? 0)
            : !corrections[d.id] && d.node.verifyBy.kind == "equalStringCollection" || d.node.verifyBy.kind == "equalNumberCollection"
                ? calculatePointsByErrorCount(d, answers)
                : corrections[d.id] ? (d.node.points ?? 0) : 0;
        return out;
    }, 0);
    const calculateCustom = (computBy, children) => {
        const successCount = children.map(d => corrections[d.id]).filter(d => d).length;
        const points = computBy.args.filter(d => d.min <= successCount).map(d => d.points);
        return points.length > 0 ? Math.max(...points) : 0;
    };
    totalPoints = calculatePoints(tree, (computeBy, leafs) => computeBy != null && computeBy.kind == "group"
        ? calculateCustom(computeBy, leafs)
        : calculateSum(leafs));
    return totalPoints;
};
function calculateMaxTotalPoints(tree) {
    let totalPoints = 0;
    if (tree == null)
        return totalPoints;
    const calculateSum = (children) => children.reduce((out, d) => {
        const verifyBy = d.node.verifyBy;
        const maxPoints = verifyBy.kind == "selfEvaluate" ?
            verifyBy.args.options.reduce((out, d) => out = out > d.value ? out : d.value, 0) :
            d.node.points ?? 0;
        out += maxPoints;
        return out;
    }, 0);
    const calculate = (computeBy, leafs) => {
        const res = computeBy != null && computeBy.kind == "group" ?
            computeBy.args.reduce((out, d) => out = out > d.points ? out : d.points, 0)
            : calculateSum(leafs);
        return res;
    };
    totalPoints = calculatePoints(tree, calculate);
    return totalPoints;
}
;
export function calculatePoints(tree, calculate) {
    const traverse = (node, leafs, level = 0) => {
        let total = 0;
        // Check if the current node is a leaf (no children)
        if (!node.children || node.children.length === 0) {
            leafs.push(node.data);
            return level === 0 ? calculate(null, leafs) : 0;
        }
        else {
            const group = node.data;
            //clear leafs for each composite node
            leafs = [];
            // Recursively calculate total points for each child node						
            for (const childNode of node.children) {
                const points = traverse(childNode, leafs, level + 1);
                total += points;
                //if (level == 0) console.log(childNode.data.id, points)
            }
            //points for leafs    
            //if (level == 0) console.log(leafs.map(d => d.id))
            total += leafs.length > 0 ? calculate(group.node.metadata?.computeBy, leafs) : 0;
        }
        return total;
    };
    const totalPoints = traverse(tree, []);
    return totalPoints;
}
