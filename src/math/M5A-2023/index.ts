import { commonSense, compDiff, cont, ctor, gcd, lcd, primeFactorization, product, rate, sum } from "../../components/math";
import { axiomInput, deduce, last, to } from "../../utils/deduce-utils";

export const hledani_cisel = ({ input }: { input: { value: number } }) => {
  const entity = "";
  return {
    deductionTree: deduce(
      to(
        axiomInput(cont("zadaná hodnota", input.value, entity), 1),
        commonSense(`rozklad na prvočísla:${primeFactorization([input.value]).join(",")}`),
        commonSense(`rozdělím na 2 skupiny, tak aby bylo lehce dělitelné 6`),
        commonSense('prvni skupina 2 x 3 = 6, resp. číslo zvětšené = 6 x 2'),
        commonSense('druhe skupina 2 x 3 x 5 = 30, resp. číslo zmenšené = 30 / 6 = 5'),
        cont("prvni změněné číslo", 12, entity)
      ),
      cont("druhe změněné čislo", 5, entity),
      product("součin", [], entity, entity)
    )
  }
}

export const klubSEN = () => {
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
      sum("celkem učastníků", [], entity, entity)
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
      sum("navštěvuje více kroužků", [], entity, entity)
    ),
    ctor('comp-diff')
  );
  return {
    jedenKrouzek: {
      deductionTree: one
    },
    klub:{
      deductionTree: deduce(
        last(one),
        two,
        three,
        sum("počet dětí",[], entity, entity)
      )
    }
  }
}

export const desitiuhelnik = () => {
  const squareSizeLabel = "strana čtverce";
  const entity = "cm"
  const entity2d = "cm2"
  const rectangleWidthLabel = "šířka obdelníka"
  const triangleWidthLabel = " nejdelší straně trojůhelníku"

  const squareSize = to(
    axiomInput(cont("nejkratší strana desitiúhelník", 4, entity), 1),
    commonSense("tato délka odpovídá straně čtverce"),
    cont(squareSizeLabel, 4, entity)
  )
  const rectangleWidth = to(
    axiomInput(cont("nejdelší strana desitiúhelník", 20, entity), 2),
    commonSense("tato délka odpovídá šířce obdélníku"),
    cont(rectangleWidthLabel, 20, entity)
  )
  const whiteTriangle = to(
    commonSense("2 čtverce tvoří výšku bílého rovnostranného trojůhelníku"),
    cont("výška šedého trojúhelníku", 2 * 4, entity),
  )

  const triangleHeight = to(
    commonSense("tři čtverce tvoří nejkratší straně trojůhelníku"),
    cont("výška šedého trojúhelníku", 3 * 4, entity),
  )
  const triangleWidth = to(
    axiomInput(cont("nejdelší strana desitiúhelník", 20, entity), 2),
    commonSense("tato délka odpovídá nejdelší straně trojůhelníku"),
    cont(triangleWidthLabel, 20, entity)
  )

  //const rectangleWidth = cont(rectangleWidthLabel, 5, entity);
  const whiteTriangleSize = to(
    squareSize,
    commonSense("2 čtverce tvoří stranu bílého rovnostranného trojůhelníku"),
    cont("strana bílý trojúhelník", 2 * 4, entity)
  );
  return {
    whiteTriangle: {
      deductionTree: deduce(
        whiteTriangleSize,
        cont("počet stran trojúhelníku", 3, ""),
        product("obvod", [], entity, entity)
      )
    },
    grayRectangle: {
      deductionTree: deduce(
        deduce(
          to(
            last(whiteTriangleSize),
            commonSense("strana bíleho trojúhelníku odpovídá výška šedého obdelníku"),
            cont("výška šedého obdelníku", 8, entity)
          ),
          cont("počet", 2, ""),
          product("horní a dolní strana", [], entity, entity)
        ),
        deduce(
          rectangleWidth,
          cont("počet", 2, ""),
          product("levá a pravá strana", [], entity, entity)
        ),
        sum("obvod", [], entity, entity)
      )
    },
    grayTriangle: {
      deductionTree: deduce(
        triangleHeight,
        triangleWidth,
        deduce(
          last(triangleWidth),
          last(squareSize),
          ctor('comp-diff')
        ),
        sum("obvod", [], entity, entity)
      )
    }
  }

}
export const stavebnice = () => {
  const entity = "cm";

  const cube = ({ length, width, height }) => ({
    length: cont("délka", length, entity),
    width: cont("šířka", width, entity),
    height: cont("výška", height, entity)
  })

  const base = cube({ length: 4, width: 4, height: 6 })
  const inputCube = cube({ length: 8, width: 12, height: 16 })

  const minimalSize = deduce(
    base.length,
    base.width,
    base.height,
    lcd("nejmenší možná velikost strany krychle", entity)
  )

  return {
    cube: {
      deductionTree: deduce(
        deduce(
          inputCube.length,
          inputCube.width,
          inputCube.height,
          product("objem", [], "cm3", entity)
        ),
        deduce(
          base.length,
          base.width,
          base.height,
          product("objem", [], "cm3", entity)
        ),
        ctor("rate")
      )
    },
    minimalCube: {
      deductionTree: deduce(
        deduce(
          minimalSize,
          last(minimalSize),
          last(minimalSize),
          product("objem", [], "cm3", entity)
        ),
        deduce(
          base.length,
          base.width,
          base.height,
          product("objem", [], "cm3", entity)
        ),
        ctor("rate")
      )
    }

  }
}
