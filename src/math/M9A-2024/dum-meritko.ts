
import { cont, ctor, gcd, product } from "../../components/math.js";
import { axiomInput, deduce } from "../../utils/deduce-utils.js";


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
  const widthLabel = "šířka"
  const lengthLabel = "délka"
  const entity = "cm"
  const entity2D = "cm ctverecni"


  const width = axiomInput(cont(skutecnost, input.sirkaM * 100, entity), 1);
  const widthOnPlan = axiomInput(cont(plan, input.planSirkaCM, entity), 2);
  const lengthOnPlan = axiomInput(cont(plan, input.planDelkaDM * 10, entity), 3);


  const dBase =
    deduce(
      widthOnPlan,
      width,
      ctor('ratios')
    )



  const dTree1 = deduce(
    dBase,
    deduce(widthOnPlan, width, gcd("nejmenší společný násobek", entity)),
    ctor("simplify")
  )


  const dTree2 = deduce(
    cont(plan, 20, entity),
    dBase,
  )

  const ddSkutecnost = deduce(
    dTree2,
    width,
    product(`${skutecnost} obsah`, [lengthLabel, widthLabel], entity2D, entity)
  )
  const ddPlan = deduce(
    lengthOnPlan,
    widthOnPlan,
    product(`${plan} obsah`, [lengthLabel, widthLabel], entity2D, entity)
  )


  const dTree3 = 
  deduce(
    deduce(
      ddPlan,
      ddSkutecnost,
      ctor('ratios')
    ),
    deduce(ddPlan.children[3], ddSkutecnost.children[3], gcd("nejmenší společný násobek", entity)),
    ctor("simplify")
  )



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
    { deductionTree: dTree3, template: highlight => highlight`${() => templateBase(highlight)}${template3}` }
  ]
}