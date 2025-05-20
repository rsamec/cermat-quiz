import { type Container, product, cont } from "../../components/math"
import { deduce, last, type TreeNode } from "../../utils/deduce-utils"

export function triangleArea({ size, height, triangle }: { size: Container | TreeNode, height: Container, triangle: { agent: string, entity?: string, unit?: string } }) {
  const agent = triangle.agent;
  const unit = triangle.unit ?? "";
  const entity = triangle.entity ?? "obsah"

  const container = (size as any).kind === "cont" ? size as Container : last(size as TreeNode);
  return deduce(
    cont("polovina", 1 / 2, ""),
    size,
    height,
    product(agent, ["1/2", container.agent, height.agent], { entity, unit }, { entity: container.entity, unit: container.unit })
  )
}
