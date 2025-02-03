
import { commonSense, cont, ctor, ctorRatios, ctorUnit, gcd, nthPart, type PartToPartRatio, product, ratios } from "../../components/math.js";
import { axiomInput, deduce, deduceLbl, last, to } from "../../utils/deduce-utils.js";


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
  const entity = "";
  const unit = "cm";
  const unit2D = "cm2";


  const width = axiomInput(cont(`${skutecnost} ${widthLabel}`, input.sirkaM, entity, "m"), 1);
  const widthOnPlan = axiomInput(cont(`${plan} ${widthLabel}`, input.planSirkaCM, entity, unit), 2);
  const lengthOnPlan = axiomInput(cont(`${plan} ${lengthLabel}`, input.planDelkaDM, entity, "dm"), 3);

  const dWidth = deduce(width, ctorUnit(unit));
  const dBase =
    deduce(
      widthOnPlan,
      dWidth,
      ctorRatios("měřítko"),
    )

  const dTree1 = deduce(
    dBase,
    deduce(widthOnPlan, width, gcd("nejmenší společný násobek", entity)),
    ctor("simplify")
  )

  const meritko = { ...last(dTree1) as unknown as PartToPartRatio, ...deduceLbl(3) }
  const dTree2 = deduce(
    deduce(lengthOnPlan,ctorUnit(unit)),
    to(
      meritko,
      commonSense("měřítko plánu platí pro celý plán, stejně pro šírku a délku domu"),
      ratios("měřítko", [`${plan} ${lengthLabel}`, `${skutecnost} ${lengthLabel}`], meritko.ratios)
    ),
    nthPart(`${skutecnost} ${lengthLabel}`)
  )

  const ddSkutecnost = deduce(
    dTree2,
    dWidth,
    product(`${skutecnost} obsah`, [lengthLabel, widthLabel], unit2D, entity)
  )
  const ddPlan = deduce(
    deduce(lengthOnPlan,ctorUnit(unit)),
    widthOnPlan,
    product(`${plan} obsah`, [lengthLabel, widthLabel], unit2D, entity)
  )


  const dTree3 =
    deduce(
      deduce(
        ddPlan,
        ddSkutecnost,
        ctorRatios("měřítko"),
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