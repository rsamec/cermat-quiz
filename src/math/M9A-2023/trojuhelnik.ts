
import { commonSense, comp, cont, ctor, sum, productCombine } from "../../components/math";
import { deduce, last, to } from "../../utils/deduce-utils";


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

  const inputContainers = [1, 3, 9].map((d, i) => cont(`${agent} č.${i + 1}`, d, whiteEntity));

  const soucet = sum("obrazec č.7", { entity })

  const rule1 = commonSense("V každém kroku se přidává šedý trojúhelník do každého bílého trojúhelníku.")
  const rule2 = commonSense("Počet šedých trojúhelníků v následujícím obrazci se zvýší o počet bílých trojúhelníků v předchozím obrazci.")


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
      last(dBase),
      cont(`${agent} č.6`, 6, nthLabel),
    ),
    to(
      rule1,
      rule2,
      cont(`${agent} č.6`, 121, grayEntity),
    ),
    soucet
  )

  const dTree3 = deduce(
    to(
      comp("poslední obrazec", "předposlední obrazec", 6_561, grayEntity),
      rule1,
      rule2,
      cont("předposlední obrazec", 6_561, whiteEntity),
    ),
    to(
      last(dBase),
      cont("následující obrazec (n*3)", 3, "")
    ),
    productCombine("poslední obrazec", whiteEntity, ["předposlední obrazec", "3"]),
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
    { title: 'Počet bílých trojúhelníků v pátém obrazci', deductionTree: dTree1, template: highlight => highlight`${() => templateBase(highlight)}${template1}` },
    { title: 'Počet šedých trojúhelníků v sedmém obrazci', deductionTree: dTree2, template: highlight => highlight`${() => templateBase(highlight)}${template2}` },
    { title: ' Počet bílých trojúhelníků v posledním obrazci', deductionTree: dTree3, template: highlight => highlight`${() => templateBase(highlight)}${template3}` },
  ]
}