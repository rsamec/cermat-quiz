
import { cont, ctor, ctorUnit, gcd, nthPart } from "../../components/math.js";
import { axiomInput, deduce, last } from "../../utils/deduce-utils.js";


interface Params {
  skutecnost: number
  plan: number

}
export default function build({ input }: {
  input: Params,
}) {
  const skutecnost = "skutečnost"
  const mapa = "plán"
  const entity = ""
  const unit = "cm";

  const reality = axiomInput(cont(skutecnost, input.skutecnost, entity, "km"), 1);
  const plan = axiomInput(cont(mapa, input.plan, entity, unit), 2);



  const dBase =
    deduce(
      deduce(plan,
        deduce(reality, ctorUnit(unit)),
        ctor('ratios')),
      deduce(plan, reality, gcd("nejvyšší společný násobek", entity)),
      ctor('simplify')
    )

  const dTree1 = dBase;

  const dTree2 =
    deduce(
      deduce(
        cont(mapa, 3, entity, unit),
        last(dBase),
        nthPart(skutecnost)
      ),
      ctorUnit("km"))

  const dTree3 =
    deduce(
      deduce(cont(skutecnost, 5, entity, "km"), ctorUnit(unit)),
      last(dBase),
      nthPart(mapa)
    )


  const templateBase = highlight => highlight
    `Vzdálenost mezi městy je ${input.skutecnost} kilometrů. 
    V plánu je tato vzdálenost vyznačena úsečkou o délce ${input.plan} cm.`

  const template1 = html => html`<br/>
    <strong>Určete měřítko plánu.</strong>`;

  const template2 = html => html`<br/>
    <strong>Jak velká je vzdálenost ve skutečnosti pokud by vzdálenost na mapě byla 3 cm.</strong>`;

  const template3 = html => html`<br/>
    <strong>Jak velká je vzdálenost na mapě pokud by vzdálenost ve skutečnosti byla 5 km.</strong>`;

  return [
    { deductionTree: dTree1, template: highlight => highlight`${() => templateBase(highlight)}${template1}` },
    { deductionTree: dTree2, template: highlight => highlight`${() => templateBase(highlight)}${template2}` },
    { deductionTree: dTree3, template: highlight => highlight`${() => templateBase(highlight)}${template3}` }
  ]
}