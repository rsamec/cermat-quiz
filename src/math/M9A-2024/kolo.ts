import { cont, inferenceRule, ratio, sum, ctor, type Container, comp } from "../../components/math.js";
import { to, deduce, deduceLbl, axiomInput } from "../../utils/deduce-utils.js";
import { percentPart } from "../percent/part.js";


const entity = "Kč";
const entityPercent = "%"


export function example3({ input }: {
  input: {
    base: number;
    percentageDown: number;
    percentageNewUp: number;
  },
}) {

  const agentPercentBase = "cena";
  const agentPercentPart = "sleva";
  const entity = "Kč";
  const entityPercent = "%"

  const percent = cont(agentPercentPart, input.percentageDown, entityPercent)
  const celek = cont(agentPercentBase, 100, entityPercent);
  const dd1 = inferenceRule(percent, celek, ctor('ratio'));
  const dd1Up = axiomInput(ratio("cena po slevě", "zdraženo", input.percentageNewUp / 100), 3)

  const percentBase = cont(agentPercentBase, input.base, entity)
  const dd2 = inferenceRule(percentBase, dd1);

  const sleva = comp(agentPercentBase, "cena po slevě", dd2.kind === 'cont' && dd2.quantity, entity)
  const dd3 = inferenceRule(sleva, percentBase);

  const dd4 = inferenceRule(dd3, dd1Up);

  const soucet = sum("konečná cena", ["cena po slevě", "zdraženo"], entity, entity);
  const dd5 = inferenceRule(dd3, dd4, soucet)



  const percentage1 = axiomInput(cont(agentPercentPart, input.percentageDown, entityPercent), 2);
  const base1 = axiomInput(cont(agentPercentBase, input.base, entity), 1);

  const dBase1 = percentPart({ base: base1, percentage: percentage1 });


  const deductionTree =
    deduce(
      deduce(
        deduce(
          to(
            dBase1,
            sleva
          ),
          base1,
        ),
        dd1Up,
      ),
      { ...dd3, ...deduceLbl(3) },
      soucet,
    )

  const template = highlightLabel => highlightLabel`Kolo v obchodě stálo ${input.base.toLocaleString("cs-CZ")} Kč.
    Nejdříve bylo zlevněno o ${input.percentageDown} % z původní ceny.
    Po měsíci bylo zdraženo o ${input.percentageNewUp} % z nové ceny.
    ${(html) => html`<br/><strong>Jaká byla výsledná cena kola po zlevnění i zdražení?</strong>`}`;

  return { deductionTree, template }

}

export function example1({ input }: {
  input: {
    base: number,
    percentage: number
  }
}) {
  const template = highlightLabel => highlightLabel`
  Pan Novák si vypůjčil ${input.base.toLocaleString("cs-CZ")} Kč na jeden rok.
  Po roce vrátí věřiteli vypůjčenou částku, a navíc mu zaplatí úrok ve výši ${input.percentage} % z vypůjčené částky.
  Kolik korun celkem věřiteli vrátí?`

  const vypujceno = axiomInput(cont("vypůjčeno", 20_000, entity), 1);
  const urok = axiomInput(cont("úrok", 13.5, '%'), 2);

  const deductionTree = deduce(
    percentPart({ base: vypujceno, percentage: urok }),
    vypujceno,
    sum("vráceno", ["úrok", "vypůjčeno"], entity, entity)
  )

  return { deductionTree, template }
}

export function example2({ input }: {
  input: {
    vlozeno: number,
    urokPercentage: number
    danPercentage: number
  }
}) {
  const template = highlightLabel => highlightLabel`
  Paní Dlouhá na začátku roku vložila do banky ${input.vlozeno.toLocaleString('cs-CZ')} Kč s roční úrokovou sazbou ${input.urokPercentage} %.
  Výnosy z úroků jsou zdaněny srážkovou daní.
  Kolik korun získá paní Dlouhá navíc ke svému vkladu za jeden rok, bude-li jí odečtena daň z úroků ${input.urokPercentage} %?`

  const vlozeno = axiomInput(cont("vklad", input.vlozeno, entity), 1);
  const výnos = axiomInput(cont("výnos", input.urokPercentage, entityPercent), 2);
  const dan = axiomInput(cont("daň", input.danPercentage, entityPercent), 3);

  const dBase = percentPart({ base: vlozeno, percentage: výnos })
  const deductionTree = deduce(
    dBase,
    percentPart({ base: {...dBase.children[dBase.children.length - 1] as Container,...deduceLbl(2)}, percentage: dan }),
  )




  return { deductionTree, template }

}