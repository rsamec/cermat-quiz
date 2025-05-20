
import { cont, ctor, ctorUnit, gcd, nthPart } from "../../components/math";
import { axiomInput, deduce, last } from "../../utils/deduce-utils";


interface Params {
  skutecnost: number
  plan: number

}
export default function build({ input }: {
  input: Params,
}) {
  const skutecnost = "skutečnost"
  const mapa = "plán"
  const unit = "cm";
  const agent = "vzdálenost"

  const reality = axiomInput(cont(agent, input.skutecnost, skutecnost, "km"), 1);
  const plan = axiomInput(cont(agent, input.plan, mapa, unit), 2);



  const dBase = deduce(
        deduce(reality, ctorUnit(unit)),
        plan,
        ctor('rate')
      )
    

  const dTree1 = dBase;

  const dTree2 =
    deduce(
      deduce(
        plan,
        last(dBase),
      ),
      ctorUnit("km"))

  const dTree3 =
    deduce(
      deduce(reality, ctorUnit(unit)),
      last(dBase),
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