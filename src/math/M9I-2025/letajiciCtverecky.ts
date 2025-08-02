import { productCombine, commonSense, cont, primeFactorization } from "../../components/math";
import { axiomInput, deduce, to } from "../../utils/deduce-utils";


interface InputParameters {
  pocetRad: number,
  pocetSloupcu: number,

}
export function letajiciCtverecky({ input }: { input: InputParameters }) {

  const entity = "čtverec";
  const rowLabel = "řad";
  const columnLabel = "sloupec";

  const lowerRectLabel = "nižší obdelník";
  const hiherRectLabel = "vyšší obdelník";

  const rows = axiomInput(cont(lowerRectLabel, input.pocetRad, rowLabel), 1);
  const columns = axiomInput(cont(hiherRectLabel, input.pocetSloupcu, columnLabel), 1);
  const rule = axiomInput(commonSense("počet řad je vždy o 1 vyšší než počet sloupců"), 2);

  const dd1 = deduce(
    to(
      rows,
      rule,
      cont(lowerRectLabel, input.pocetRad - 1, columnLabel),
    ),
    rows,
    productCombine(hiherRectLabel, columnLabel, [rowLabel, columnLabel])
  )

  const dd2 = to(
    columns,
    commonSense(`rozklad na prvočísla:${primeFactorization([input.pocetSloupcu]).join(",")}`),
    commonSense(`seskup je do dvojic (5x22), (10x11), (2x55)`),
    commonSense(`najdi dvojici, která má čísla za sebou = (10x11)`),
    rule,
    cont(lowerRectLabel, 11, rowLabel)
  )



  return [
    { deductionTree: dd1 },
    { deductionTree: dd2 }
  ]
}
