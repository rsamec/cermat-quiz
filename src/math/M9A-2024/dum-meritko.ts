
import { cont, comp, ctor, compDiff, sum, commonSense, rate, ctorRatios, gcd } from "../../components/math.js";
import { axiomInput, deduce, to } from "../../utils/deduce-utils.js";


interface Params {
  sirkaM: number
  planSirkaCM: number
  planDelkaDM: number

}
export default function build({ input }: {
  input: Params,
}) {
  const skutecnost = "skutečnost"
  const plan = "plán"
  const entity = "cm"
  const meritkoLabel = "dum"






  const s = axiomInput(cont(skutecnost, input.sirkaM * 100, entity), 1);
  const sPlan = axiomInput(cont(plan, input.planSirkaCM, entity), 2);
  const dPlan = axiomInput(cont(plan, input.planDelkaDM * 10, entity), 3);


  const oneD = "délka"
  const twoD = "šířka"
  const threeD = "výška"


  const obsah = rate("obsah", 5, twoD, oneD)
  const objem = rate("objem", 7, threeD, twoD)

  const dBase =  
    deduce(
      sPlan,
      s,
      ctor('ratios')
    )



  const dTree1 = deduce(
    dBase,
    deduce(sPlan,s,gcd("největší společný násobek",entity)),
    ctor("simplify")
  )
    

  const dTree2 = deduce(
    cont(plan, 20, entity),
    dBase,
  )

  // const dTree3 = deduce(
  //   deduce(
  //     cont("pocet", 4, oneD),
  //     obsah),
  //   objem

  // )



  const templateBase = highlight => highlight
    `Půdorys domu má tvar obdélníku. 
    Šířka domu je ${input.sirkaM} metrů. 
    V plánu je tato šířka vyznačena úsečkou o délce ${input.planSirkaCM} cm. 
    Délka domu je v plánu zakreslena jako úsečka o délce ${input.planDelkaDM} dm.`

  const template1 = html => html`<br/>
    <strong>Měřítko plánu je 1:1 000.</strong>`;

  const template2 = html => html`<br/>
    <strong>Skutečná délka domu je 20m.</strong>`;

  const template3 = html => html`<br/>
    <strong>Obsah obdélníku na plánu a obsah půdorysu domu jsou v poměru 1:100.</strong>`;

  return [
    { deductionTree: dTree1, template: highlight => highlight`${() => templateBase(highlight)}${template1}` },
    { deductionTree: dTree2, template: highlight => highlight`${() => templateBase(highlight)}${template2}` },
    { deductionTree: dTree2, template: highlight => highlight`${() => templateBase(highlight)}${template3}` }
  ]
}