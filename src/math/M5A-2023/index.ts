import { commonSense, cont, ctor, ctorBooleanOption, ctorOption, lcd, rate, sum, counter, product, ctorScale, ctorScaleInvert, ratios, ctorDifference, contLength, dimensionEntity, productVolume } from "../../components/math";
import { axiomInput, createLazyMap, deduce, last, to } from "../../utils/deduce-utils";
import { comparingValues } from "../comparing-values";
import { compass } from "../compass";
import cetar from "../M7A-2023/cetar";
import zakusek from "../M7A-2023/zakusek";
import { obrazce } from "../obrazce";
import { odmenySoutezici } from "../odmeny-soutezici";
import { sesity } from "../sesity";
import { trideni_odpadu } from "../trideni-odpady";

const cetarParams = {
  input: {
    kapitan: 1,
    porucik: 4,
    cetarPerPorucik: 3,
    vojinPerCetar: 10
  }
};
export default createLazyMap({
  2.1: () => comparingValues({
    input: {
      first: {
        ratio: 1 / 4,
        value: 24
      },
      second: {
        ratio: 1 / 3,
        value: 12
      }
    }
  }),
  2.2: () => hledani_cisel({
    input: {
      value: 180
    }
  }),
  3.1: () => cetar(cetarParams)[0],
  3.2: () => cetar(cetarParams)[1],
  3.3: () => cetar(cetarParams)[2],
  4.1: () => sesity()[0],
  4.2: () => sesity()[1],
  4.3: () => compass(),
  5.1: () => klubSEN().jedenKrouzek,
  5.2: () => klubSEN().klub,
  6.1: () => odmenySoutezici()[0],
  6.2: () => odmenySoutezici()[1],
  8.1: () => desitiuhelnik().whiteTriangle,
  8.2: () => desitiuhelnik().grayRectangle,
  8.3: () => desitiuhelnik().grayTriangle,
  9: () => zakusek({
    input: {
      cena: 72
    }
  }),
  10: () => minceVKasicce(),
  11: () => stavebnice().cube,
  12: () => stavebnice().minimalCube,
  13.1: () => trideni_odpadu().papirRtoS,
  13.2: () => trideni_odpadu().plast1,
  13.3: () => trideni_odpadu().papirToKovy,
  14.1: () => obrazce()[0],
  14.2: () => obrazce()[1],
  14.3: () => obrazce()[2]
})


function hledani_cisel({ input }: { input: { value: number } }) {

  return {
    deductionTree: deduce(
      deduce(
        axiomInput(counter("zadaná hodnota", input.value), 1),
        counter("zvětšení", 2),
        ctorScale("zvětšená hodnota")
      ),
      counter("zmenšení", 6),
      ctorScaleInvert("výsledná hodnota")
    )
  }
}

function klubSEN() {
  const entity = 'dítě'
  const entityKrouzek = "účast kroužek";
  const sportovni = cont("sportovní", 14, entity)
  const divadelni = cont("divadelní", 12, entity)
  const roboticky = cont("robotický", 6, entity)

  const threeRate = rate("navštěvuje 3 kroužky", 3, entityKrouzek, entity)
  const twoRate = rate("navštěvuje 2 kroužky", 2, entityKrouzek, entity)

  const three = cont("navštěvuje 3 kroužky", 3, entity)
  const two = cont("navštěvuje 2 kroužky", 8, entity)

  const one = deduce(
    deduce(
      sportovni,
      divadelni,
      roboticky,
      sum("celkem učastníků")
    ),
    deduce(
      deduce(
        threeRate,
        three
      ),
      deduce(
        twoRate,
        two
      ),
      sum("navštěvuje více kroužků", { entity })
    ),
    ctorDifference('navštěvuje 1 kroužek')
  );
  return {
    jedenKrouzek: {
      deductionTree: one
    },
    klub: {
      deductionTree: deduce(
        last(one),
        two,
        three,
        sum("počet dětí")
      )
    }
  }
}

function desitiuhelnik() {
  const squareSizeLabel = "strana čtverce";


  const rectangleWidthLabel = "šířka obdelníka"
  const triangleWidthLabel = "nejdelší straně trojúhelníku"

  const squareSize = to(
    axiomInput(contLength("nejkratší strana desitiúhelník", 4), 1),
    commonSense("tato délka odpovídá straně čtverce"),
    contLength(squareSizeLabel, 4)
  )
  const rectangleWidth = to(
    axiomInput(contLength("nejdelší strana desitiúhelník", 20), 2),
    commonSense("tato délka odpovídá šířce obdélníku"),
    contLength(rectangleWidthLabel, 20)
  )
  const whiteTriangle = to(
    commonSense("2 čtverce tvoří výšku bílého rovnostranného trojúhelníku"),
    contLength("výška šedého trojúhelníku", 2 * 4),
  )

  const triangleHeight = to(
    commonSense("tři čtverce tvoří nejkratší straně trojúhelníku"),
    contLength("výška šedého trojúhelníku", 3 * 4),
  )
  const triangleWidth = to(
    axiomInput(contLength("nejdelší strana desitiúhelník", 20), 2),
    commonSense("tato délka odpovídá nejdelší straně trojúhelníku"),
    contLength(triangleWidthLabel, 20)
  )

  //const rectangleWidth = cont(rectangleWidthLabel, 5);
  const whiteTriangleSize = to(
    squareSize,
    commonSense("2 čtverce tvoří stranu bílého rovnostranného trojúhelníku"),
    contLength("strana bílý trojúhelník", 2 * 4)
  );
  return {
    whiteTriangle: {
      deductionTree: deduce(
        deduce(
          whiteTriangleSize,
          counter("počet stran trojúhelníku", 3),
          product("obvod")
        ),
        ctorBooleanOption(12)
      )
    },
    grayRectangle: {
      deductionTree: deduce(
        deduce(
          deduce(
            to(
              last(whiteTriangleSize),
              commonSense("strana bíleho trojúhelníku odpovídá výška šedého obdelníku"),
              contLength("výška šedého obdelníku", 8)
            ),
            counter("počet stran", 2),
            product("horní a dolní strana")
          ),
          deduce(
            rectangleWidth,
            counter("počet stran", 2),
            product("levá a pravá strana")
          ),
          sum("obvod")
        ),
        ctorBooleanOption(56)
      )
    },
    grayTriangle: {
      deductionTree: deduce(
        deduce(
          triangleHeight,
          triangleWidth,
          deduce(
            last(triangleWidth),
            last(squareSize),
            ctor('comp-diff')
          ),
          sum("obvod")
        ),
        ctorBooleanOption(50, "greater")
      )
    }
  }

}
function stavebnice() {
  const dim = dimensionEntity()
  const cube = ({ length, width, height }) => ({
    length: contLength("délka", length),
    width: contLength("šířka", width),
    height: contLength("výška", height)
  })

  const base = cube({ length: 4, width: 4, height: 6 })
  const inputCube = cube({ length: 8, width: 12, height: 16 })

  const minimalSize = deduce(
    base.length,
    base.width,
    base.height,
    lcd("nejmenší možná velikost strany krychle", dim.length.entity)
  )

  return {
    cube: {
      deductionTree: deduce(
        deduce(
          deduce(
            inputCube.length,
            inputCube.width,
            inputCube.height,
            productVolume("kvádr")
          ),
          deduce(
            base.length,
            base.width,
            base.height,
            productVolume("kvádr")
          ),
          ctor("rate")
        ),
        ctorOption("C", 16)
      )
    },
    minimalCube: {
      deductionTree: deduce(
        deduce(
          deduce(
            minimalSize,
            last(minimalSize),
            last(minimalSize),
            productVolume("kvádr")
          ),
          deduce(
            base.length,
            base.width,
            base.height,
            productVolume("kvádr")
          ),
          ctor("rate")
        ),
        ctorOption("D", 18)
      )
    }

  }
}


function minceVKasicce() {
  const entity = "Kč";
  const deseti = "desetikoruny";
  const peti = "pětikoruny";

  const minceEntity = "mince"
  const celkem = cont("kasička s mincemi", 78, minceEntity)
  const petiPocet = deduce(
    ratios("kasička s mincemi", [deseti, peti], [5, 10]),
    celkem,
  )
  return {
    deductionTree: deduce(
      deduce(
        deduce(petiPocet, rate(peti, 5, { entity }, { entity: minceEntity })),
        deduce(
          deduce(
            celkem,
            last(petiPocet),
            ctorDifference(deseti)
          ),
          rate(deseti, 10, { entity }, { entity: minceEntity })
        ),
        sum("celkem v kasičce")
      ),
      ctorOption("B", 520)
    )
  }
}