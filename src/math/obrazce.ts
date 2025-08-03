import { cont, ctor, commonSense, ratios, rate, sum } from "../components/math"
import { deduce, to, lastQuantity } from "../utils/deduce-utils"

export const obrazce = () => {
  const entityRow = "řádků"
  const entityColumn = "sloupců"
  const entityTmave = "tmavý čtvereček"
  const entitySvetle = "světlé čtvereček"
  const entity = "čtverečků"
  const base = "základní obrazec"
  const extended = "rozšířený obrazec"

  const dd1 = deduce(
    cont(`přidáno ${extended}`, 30, entityTmave),
    deduce(
      cont(`levý sloupec ${extended}`, 6, entityTmave),
      cont(`pravý sloupec ${extended}`, 6, entityTmave),
      sum("oba krajní sloupce")
    ),
    ctor('comp-diff')
  );
  return [
    {
      deductionTree: to(
        dd1,
        commonSense("horní řada tmavých čtverčků bez krajních sloupců rozšířeného obrazce odpovídá počtu sloupců základního obrazce"),
        cont(base, lastQuantity(dd1), entityColumn)
      )
    },
    {
      deductionTree: deduce(
        deduce(
          deduce(
            cont(`levý sloupec`, 3, entity),
            cont(`pravý sloupec`, 3, entity),
            sum("oba krajní sloupce")
          ),
          ratios(extended, [entitySvetle, "horní řada", "oba krajní sloupce"], [2, 1, 1])
        ),
        cont(extended, 3, entityRow),
        ctor("rate")
      )
    },
    {
      deductionTree: to(deduce(
        rate("oba krajní sloupce", 2, entityTmave, entityRow),
        cont("oba krajní sloupce", 24, entityRow)
      ),
        commonSense("základní obrazec je tvořen jednou nebo více řadami světlých čtverečků."),
        commonSense("2 řádky jsou minimum a 24 řádků je maximum."),
        commonSense("možných rozšířených obrazců tvoří obrazce s 2, 3, 4... 24 řádků"),
        cont("možných rozšířených obrazců s 50 tmavými čtverečky", 23, extended)
      )
    }

  ]
}
