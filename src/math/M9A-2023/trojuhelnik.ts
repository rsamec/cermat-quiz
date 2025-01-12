
import { comp, cont, ctor, inferenceRule, nth, sum } from "../../components/math.js";
import { deduce, deduceLbl } from "../../utils/deduce-utils.js";


interface InputParams {
}
export default function build({ input }: {
  input: InputParams,
}) {

  const agent = "obrazec"
  const entity = "trojúhelník";
  const whiteEntity = `bílý ${entity}`
  const grayEntity = `šedý ${entity}`
  const nthLabel = "pozice"
  const nthEntity = nth(nthLabel);

  const inputContainers = [1, 3, 9].map((d, i) => cont(`${agent} č.${i + 1}`, d, whiteEntity));

  const dSequence = inferenceRule(...inputContainers, ctor('sequence'));
  const soucet = sum("obrazec č.7", [], entity, grayEntity)

  const dBase = deduce(
    ...inputContainers,
    ctor('sequence')
  );

  const dTree1 = deduce(
    dBase,
    cont(`${agent} č.5`, 5, nthLabel),
  )

  const dTree2 = deduce(
    deduce(
      dBase,
      cont(`${agent} č.6`, 6, nthLabel),
    ),
    cont(`${agent} č.6`, 121, grayEntity),
    soucet
  )

  const dTree3 =
    deduce(
      deduce(
        deduce(
          dBase,
          cont("předposlední obrazec", 6_561, entity),
          nthEntity
        ),
        cont("posun na poslední obrazec", 1, nthEntity.entity),

        sum("poslední obrazec", [], nthEntity.entity, nthEntity.entity),
      ),
      { ...dSequence, ...deduceLbl(1) }
    )
  const templateBase = highlight => highlight
    `Prvním obrazcem je bílý rovnostranný trojúhelník. Každý další obrazec vznikne z předchozího obrazce dle následujících pravidel:.
  ${html => html`<br/>
    Nejprve každý bílý trojúhelník v obrazci rozdělíme na 4 shodné rovnostranné trojúhelníky.
    Poté v každé takto vzniklé čtveřici bílých trojúhelníků obarvíme vnitřní trojúhelník na šedo.
  `}`

  const template1 = html => html`<br/>
    <strong>Určete, kolik bílých trojúhelníků obsahuje pátý obrazec?</strong>`;

  const template2 = html => html`<br/>
    <strong>Šestý obrazec obsahuje 121 šedých trojúhelníků.Určete, kolik šedých trojúhelníků obsahuje sedmý obrazec.</strong>`;

  const template3 = html => html`<br/>
    <strong>Počet šedých trojúhelníků v posledním a v předposledním obrazci se liší o 6 561.Určete, kolik bílých trojúhelníků obsahuje poslední obrazec</strong>`;


  return [
    { deductionTree: dTree1, template: highlight => highlight`${() => templateBase(highlight)}${template1}` },
    { deductionTree: dTree2, template: highlight => highlight`${() => templateBase(highlight)}${template2}` },
    { deductionTree: dTree3, template: highlight => highlight`${() => templateBase(highlight)}${template3}` },
  ]
}