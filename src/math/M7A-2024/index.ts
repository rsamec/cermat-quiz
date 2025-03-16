import { comp, compAngle, compDiff, compPercent, compRatio, cont, ctor, ctorComplement, ctorUnit, nthPart, percent, product, ratios, sum } from "../../components/math.js";
import { axiomInput, deduce, last, to, toCont } from "../../utils/deduce-utils.js";

export const koupaliste = () => {

  const entity = "návštěvníků"

  return {
    deductionTree: deduce(
      axiomInput(percent("koupaliště loni", "koupaliště letos", 80), 1),
      axiomInput(cont("koupaliště letos", 680, entity), 2)
    )
  }
}

export const cestovni_kancelar = () => {
  const entity = "klientů"

  return {
    deductionTree: deduce(
      axiomInput(cont("červen", 330, entity), 1),
      axiomInput(compPercent("červen", "červenec", 100 - 40), 2),
    )
  }
}

export const pozemek = () => {
  const skutecnost = "skutečnost"
  const mapa = "plán"
  const entity = ""

  return {
    deductionTree: deduce(
      deduce(
        axiomInput(ratios("pozemek měřítko", [mapa, skutecnost], [1, 3_000]), 1),
        axiomInput(cont(mapa, 15, entity, "cm"), 2),
        nthPart(skutecnost)
      ),
      ctorUnit("m")
    )
  }
}

export const krouzky = () => {
  const entity = "děti";
  const entityPercent = "%";

  const basketabal = cont("basketbal", 16, entityPercent);
  const tanecni = cont("taneční", 15, entityPercent);
  const lezeckaStena = cont("lezecká stěna", 25, entityPercent);
  const bezKrouzku = cont("žádný kroužek", 6, entityPercent);

  const celek = cont("celek", 100, entityPercent);

  const florbalPocet = cont("florbal", 114, entity)

  const florbalDiff = deduce(
    celek,
    deduce(
      bezKrouzku,
      basketabal,
      tanecni,
      lezeckaStena,
      sum(`zadané údaje`, [], entityPercent, entityPercent)
    ),
    ctor('comp-diff')
  );

  const celekPocet = deduce(
    to(florbalDiff, percent("celek", "florbal", last(florbalDiff).quantity)),
    florbalPocet
  );

  return [
    {
      deductionTree: deduce(
        celekPocet,
        deduce(
          last(celekPocet),
          percent("celek", "žádný kroužek", 6)
        ),
        ctor('comp-diff')
      )
    },
    {
      deductionTree: deduce(
        last(celekPocet),
        percent("celek", "basketbal", 16)
      )
    }
  ]
}

export const angle = () => {
  const entity = "stupňů";
  const betaEntity = "beta úhel"

  const inputAngleLabel = `zadaný úhel`;
  const triangleSumLabel = 'součet úhlů v trojúhelníku';
  const triangleSum = cont(triangleSumLabel, 180, entity)
  const triangle = "úhel trojúhelníku ABC";

  const doubleBeta = deduce(
    cont(inputAngleLabel, 2, betaEntity),
    compAngle(inputAngleLabel, `${triangle} u vrcholu A`, 'alternate')
  )

  return {
    deductionTree: deduce(
      deduce(
        deduce(
          toCont(
            deduce(
              triangleSum,
              deduce(
                axiomInput(cont(inputAngleLabel, 105, entity), 1),
                compAngle(inputAngleLabel, `${triangle} u vrcholu C`, 'supplementary')
              ),
              ctor('comp-diff'))
            , { agent: `beta`, }),
          deduce(
            doubleBeta,
            cont(`${triangle} u vrcholu B`, 1, betaEntity),
            sum("beta", [], betaEntity, betaEntity)
          ),
          ctor('rate')),
        last(doubleBeta)
      ),
      compAngle(`${triangle} u vrcholu A`, 'alfa', 'supplementary')
    )
  }
}
