
import { commonSense, cont, ctor, ctorRatios, ctorUnit, gcd, nthPart, type PartToPartRatio, product, ratios } from "../../components/math.js";
import { axiomInput, deduce, deduceLbl, last, to } from "../../utils/deduce-utils.js";
import { plnaKrabice } from "../M9I-2025/krabice.js";


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

  const unit = "cm";
  const unit2D = "cm2";


  const width = axiomInput(cont(widthLabel, input.sirkaM, skutecnost, "m"), 1);
  const widthOnPlan = axiomInput(cont(widthLabel, input.planSirkaCM, plan, unit), 2);
  const lengthOnPlan = axiomInput(cont(lengthLabel, input.planDelkaDM, plan, "dm"), 3);

  const dWidth = deduce(width, ctorUnit(unit));
  const meritko =
    deduce(
      dWidth,
      widthOnPlan,
      ctor("rate")
    )

  const lastMeritko = last(meritko);
  const dTree2 = deduce(
    deduce(lengthOnPlan, ctorUnit(unit)),
    lastMeritko
  )

  const ddSkutecnost = deduce(
    dTree2,
    dWidth,
    product(`obsah`, [lengthLabel, widthLabel], { entity: skutecnost, unit: unit2D }, { entity: skutecnost, unit })
  )
  const ddPlan = deduce(
    deduce(lengthOnPlan, ctorUnit(unit)),
    widthOnPlan,
    product(`obsah`, [lengthLabel, widthLabel], { entity: plan, unit: unit2D }, { entity: plan, unit })
  )


  const dTree3 = deduce(
    ddSkutecnost,
    ddPlan,
    ctor('rate')
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
    { deductionTree: meritko, template: highlight => highlight`${() => templateBase(highlight)}${template1}` },
    { deductionTree: dTree2, template: highlight => highlight`${() => templateBase(highlight)}${template2}` },
    { deductionTree: dTree3, template: highlight => highlight`${() => templateBase(highlight)}${template3}` }
  ]
}