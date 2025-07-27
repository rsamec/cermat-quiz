
import { cont, ctor, inferenceRule, nth } from "../../components/math";
import { deduce, deduceLbl } from "../../utils/deduce-utils";


interface InputParams {
}
export default function build({ input }: {
  input: InputParams,
}) {

  const agent = "obrazec"
  const entity = "pole";
  // const whiteEntity = `světlá ${entity}`
  // const grayEntity = `tmavá ${entity}`
  const nthLabel = "pozice"
  const nthEntity = nth(nthLabel);

  const inputContainers = [1, 5, 13].map((d, i) => cont(`${agent} č.${i + 1}`, d, entity));

  const dSequence = inferenceRule(...inputContainers, ctor('sequence'));
  // const soucetLiche = combine("liche cisla", [], entity, entity)
  // const soucetSude = combine("suda cisla", [], entity, entity)
  // const sude = [2, 4, 6, 8, 10].map(d => cont("sude", d, entity))
  // const liche = [1, 3, 5, 7, 9].map(d => cont("liche", d, entity))

  const diffEntity = 'rozdil tmavých a světlych'
  const diffSequence = [3, 7, 11].map((d, i) => cont(`${i + 1}.sudý ${agent} č.${(i + 1) * 2}`, d, diffEntity));
  const darkEntity = 'tmavý čtverec'
  const darkSequence = [4, 16, 36].map((d, i) => cont(`${i + 1}.sudý ${agent} č.${(i + 1) * 2}`, d, darkEntity));
  const dBase = deduce(
    ...inputContainers,
    ctor('sequence')
  );


  const dTree1 = deduce(
    deduce(
      dBase,
      cont(`${agent} č.8`, 8, nthLabel),
    ),
    deduce(
      { ...dSequence, ...deduceLbl(1) },
      cont(`${agent} č.9`, 9, nthLabel),
    ),
  )

  const dTree2 =
    deduce(
      deduce(
        ...diffSequence,
        ctor('sequence')
      ),
      cont('5.sudy obrazec č.10', 5, nthLabel),
    )

  const dTree3 =
    deduce(
      deduce(
        ...darkSequence,
        ctor('sequence')
      ),
      cont('hledaný tmavý obrazec', 400, entity),
      nthEntity
    )

  // const dTree3 =
  //   deduce(
  //     deduce(
  //       deduce(
  //         dBase,
  //         cont("předposlední obrazec", 6_561, entity),
  //         nthEntity
  //       ),
  //       cont("posun na poslední obrazec", 1, nthEntity.entity),

  //       sum("poslední obrazec", [], nthEntity.entity, nthEntity.entity),
  //     ),
  //     { ...dSequence, ...deduceLbl(1) }
  //   )


  const templateBase = highlight => highlight
    `Vybarvováním některých prázdných polí čtvercové sítě postupně vytváříme obrazce.
    Prvním obrazcem je jedno světle vybarvené pole čtvercové sítě.
    Každý další obrazec vytvoříme z předchozího obrazce tak, že vybarvíme všechna prázdná pole, která mají s předchozím obrazcem společné pouze vrcholy. Tato nově vybarvená pole jsou u sudých obrazců tmavá a u lichých obrazců světlá.


  ${html => html`<br/>
    Druhý obrazec jsme vytvořili z prvního obrazce vybarvením 4 dalších polí tmavou barvou. Třetí obrazec má celkem 13 polí (9 světlých a 4 tmavé) a vytvořili jsme jej z druhého obrazce vybarvením 8 dalších polí světlou barvou.
  `}`


  const template1 = html => html`<br/>
    <strong>Vybarvením kolika dalších polí jsme z 8. obrazce vytvořili 9. obrazec?</strong>`;

  const template2 = html => html`<br/>
    <strong>O kolik se liší počet tmavých a světlých polí v 10. obrazci?</strong>`;

  const template3 = html => html`<br/>
    <strong>Kolik světlých polí může mít obrazec, který má 400 tmavých polí?</strong>`;


  return [
    { deductionTree: dTree1, template: highlight => highlight`${() => templateBase(highlight)}${template1}` },
    { deductionTree: dTree2, template: highlight => highlight`${() => templateBase(highlight)}${template2}` },
    { deductionTree: dTree3, template: highlight => highlight`${() => templateBase(highlight)}${template3}` },
  ]
}