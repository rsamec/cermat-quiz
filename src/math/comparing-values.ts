import { cont, ratio } from "../components/math";
import { axiomInput, deduce } from "../utils/deduce-utils";

export const comparingValues = ({ input }: {
  input: {
    first: {
      ratio: number,
      value: number
    }
    second: {
      ratio: number,
      value: number
    }
  }
}) => {
  const { first, second } = input;
  const entity = "litr";
  return {
    deductionTree: deduce(
      deduce(
        axiomInput(ratio("zadaná hodnota", "první hodnota", first.ratio), 1),
        axiomInput(cont("zadaná hodnota", first.value, entity), 2)
      ),
      deduce(
        axiomInput(ratio("zadaná hodnota", "druhá hodnota", second.ratio), 3),
        axiomInput(cont("zadaná hodnota", second.value, entity), 4)
      )
    )
  }
}