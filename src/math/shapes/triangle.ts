import { type Container, productCombine, cont } from "../../components/math.js"
import { deduce, last, type TreeNode } from "../../utils/deduce-utils.js"

export function triangleArea({ size, height, triangle }: { size: Container | TreeNode, height: Container, triangle: { agent: string, entity?: string, unit?: string } }) {
  const agent = triangle.agent;
  const unit = triangle.unit ?? "";
  const entity = triangle.entity ?? "obsah"

  const container = (size as any).kind === "cont" ? size as Container : last(size as TreeNode);
  return deduce(
    cont("polovina", 1 / 2, ""),
    size,
    height,
    productCombine(agent, { entity, unit }, ["1/2", container.agent, height.agent])
  )
}
