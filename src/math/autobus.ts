import { comp, cont, ctorDelta } from "../components/math.js";
import { deduce, last, to, type TreeNode } from "../utils/deduce-utils.js";

export function autobus() {
  const entity = "lidí"
  const outA = cont("vystoupili A", 0, entity)
  const outB = cont("vystoupili B", 2, entity)
  const outC = cont("vystoupili C", 4, entity)
  const outE = cont("vystoupili E", 13, entity)


  const inD = cont("nastoupili D", 6, entity)
  const inE = cont("nastoupili E", 0, entity)

  const outD = cont("vystoupili D", inD.quantity / 2, entity)
  const inB = cont("nastoupili B", outB.quantity * 2, entity)

  const startLabel = "nástupní";
  const endLabel = "konečná";

  //const start = cont(startLabel, 0, entity)
  const end = cont(endLabel, 0, entity)
  const AB = cont("jeli AB", 7, entity);

  const toComp = (predicate: TreeNode, agent: string) => to(predicate, comp(`nastoupili ${agent}`, `vystoupili ${agent}`, last(predicate).quantity, entity))
  const toTransfer = (predicate: TreeNode, agent: { name: string, nameBefore: string, nameAfter?: string }) => {
    return to(predicate, { kind: 'transfer', quantity: last(predicate).quantity, agentReceiver: agent, agentSender: agent, entity: entity })
  }

  // const deltaA = deduce(start, AB);
  // const inA = deduce(outA, toComp(deltaA, 'A'));

  const deltaB = deduce(outB, inB)
  const deltaD = deduce(outD, inD)
  const deltaE = deduce(outE, inE);


  
  const BC = deduce(AB, toTransfer(deltaB, { name: "jeli AB", nameBefore: "jeli AB", nameAfter: "jeli BC" }))
  const DE = deduce(toTransfer(deltaE, { name: endLabel, nameBefore: "jeli DE", nameAfter: endLabel }), end)
  const CD = deduce(toTransfer(deltaD, { name: "jeli DE", nameBefore: "jeli CD", nameAfter: "jeli DE" }), DE)
  const deltaC = deduce(CD, BC);
  const inC = deduce(outC, toComp(deltaC, 'C'))



  return { deductionTree: inC, template: () => `Na zastávce B nastoupilo do autobusu 2x více lidí, než z něj vystoupilo. Totéž na zastávce D.` }
}