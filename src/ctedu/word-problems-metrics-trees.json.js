import wordProblems from './word-problems.js';
import { deductionTreeToRulesHierarchy } from "../utils/deduce-utils.js";
import { rulesCategories } from "../utils/quiz-utils.js";
const rulesMap = [...rulesCategories.entries()].reduce((out, [key, values]) => {
  for (let val of values) {
    out[val] = key
  }
  return out;
}, {})

function subtreeSignature(node, children) {
  return children.length
    ? `${node.rule}(${children.join(",")})`
    : node.rule;
}
function subtreeSignatureIndexes(node, children) {  
  return children.length
    ? [node.index, ...children.flat()]
    : [node.index];
}
function indexTrees(trees, minSubtreeSize = 1) {
  const index = new Map();

  function visit(node, tree) {
    const childSignatures = [];
    const childSignaturesIndexes = []
    let size = 1;

    for (const child of node.children) {
      const result = visit(child, tree);
      childSignatures.push(result.signature);
      childSignaturesIndexes.push(result.signatureIndexes)
      size += result.size;
    }

    const signature = subtreeSignature(
      node,
      childSignatures
    );
    const signatureIndexes = subtreeSignatureIndexes(
      node,
      childSignaturesIndexes
    );
    let entry = index.get(signature);

    if (!entry) {
      entry = {
        signature,
        signatureIndexes,
        rule: node.rule,
        size,
        trees: new Map()
      };

      index.set(signature, entry);
    }

    // Keep the tree's original ID and name.
    entry.trees.set(tree.id, {
      id: tree.id,
      name: tree.name,
      code: tree.code,
      key: tree.key,
      element: `${tree.name}::${signature}`,
      signatureIndexes,
    });

    return { signature, signatureIndexes, size };
  }

  for (const tree of trees) {
    visit(tree.root, tree);
  }

  return new Map(
    [...index].filter(
      ([, subtree]) => subtree.size >= minSubtreeSize
    )
  );
}


const trees = Object.entries(wordProblems)
  .flatMap(([code, value]) => {
    return Object.entries(value).flatMap(([key, value]) => {
      const tree = deductionTreeToRulesHierarchy(value.deductionTree)
      return {
        code,
        key,
        id: `${code}-${key}`,
        name: `${code}-${key}`,
        root: tree
      }
    })
  })

function subtreeSets(
  trees,
  minSubtreeSize = 1,
  maxSubtreeSize = Infinity
) {
  const index = indexTrees(trees, minSubtreeSize);

  return trees.map(tree => {
    const sets = [...index.values()]
      .filter(
        subtree =>
          subtree.size <= maxSubtreeSize &&
          subtree.trees.has(tree.id)
      );
    return {
      id: tree.id,
      name: tree.name,
      code: tree.code,
      key: tree.key,
      question: tree.key.split(".")[0],
      signatureIndexes: sets.map(subtree => subtree.signatureIndexes),
      sets: sets.map(subtree => subtree.signature)
    }
  });
}
const result = subtreeSets(trees, 2);
process.stdout.write(JSON.stringify(result, null, 2));