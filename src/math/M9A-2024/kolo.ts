import { cont, percent, ctorDifference, ctorOption, ctorAccumulate } from "../../components/math";
import { deduce, axiomInput, last } from "../../utils/deduce-utils";

const entity = "Kč";

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

  const zlevneniPercent = axiomInput(percent(agentPercentBase, agentPercentPart, input.percentageDown), 2);
  const puvodniCena = axiomInput(cont(agentPercentBase, input.base, entity), 1);
  const zdrazeniPercent = axiomInput(percent("cena po slevě", "zdraženo", input.percentageNewUp), 3)

  const cenaPoSleve = deduce(
    puvodniCena,
    deduce(puvodniCena, zlevneniPercent),
    ctorDifference("cena po slevě")
  );
  const deductionTree = deduce(
    deduce(
      cenaPoSleve,
      deduce(
        last(cenaPoSleve),
        zdrazeniPercent
      ),
      ctorAccumulate("konečná cena"),
    ),
    ctorOption("E", 19_800)
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
  const urok = axiomInput(percent("vypůjčeno", "úrok", 13.5), 2);

  const deductionTree = deduce(
    deduce(
      deduce(
        urok,
        vypujceno
      ),
      vypujceno,
      ctorAccumulate("vráceno")
    ),
    ctorOption("A", 22_700)
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
  const vynosPercent = axiomInput(percent("vklad", "výnos", input.urokPercentage), 2);
  const danPercent = axiomInput(percent("výnos", "daň", input.danPercentage), 3);

  const vynos = deduce(vynosPercent, vlozeno)
  const deductionTree = deduce(
    deduce(
      vynos,
      deduce(danPercent, last(vynos))
    ),
    ctorOption("C", 21_250)
  )
  return { deductionTree, template }
}