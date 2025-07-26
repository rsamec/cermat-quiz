
import { cont, type Container, pi, piNumber, product, combine } from "../../components/math.js";
import { axiomInput, connectTo, deduce, last, type TreeNode } from "../../utils/deduce-utils.js";


export interface CylinderOut {
  volume: TreeNode
  surface: TreeNode
  baseCircumference: TreeNode
  surfaceBaseArea: TreeNode
}
export interface CylinderLabels {
  radiusLabel?: string
  entity?: string
  surfaceBaseAreaLabel?: string,
  entity2D?: string,
  baseCircumferenceLabel?: string,
  volumeLabel?:string

}

export function surfaceBaseArea(
  { radius }: { radius: Container },
  options?: {
    radiusLabel?: string
    entity2D?: string
    surfaceBaseAreaLabel?: string,
  }) {
  const { radiusLabel, entity2D, surfaceBaseAreaLabel } = {
    ...{
      radiusLabel: "poloměr",
      entity2D: "čtverečků",
      surfaceBaseAreaLabel: "obsah podstavy",
    },
    ...options ?? {}
  }

  return deduce(
    radius,
    radius,
    pi(),
    product(surfaceBaseAreaLabel, [radiusLabel, radiusLabel, "PI"], entity2D, radius.entity)
  )
}
export function baseCircumference(
  { radius }: { radius: Container },
  options?: {
    radiusLabel?: string
    baseCircumferenceLabel?: string,
  }) {
  const { radiusLabel, baseCircumferenceLabel } = {
    ...{
      radiusLabel: "poloměr",
      baseCircumferenceLabel: "obvod podstavy",
    },
    ...options ?? {}
  }

  return deduce(
    cont("2 * PI", 2 * piNumber(), ""),
    radius,
    product(baseCircumferenceLabel, ["2 * PI", radiusLabel], radius.entity, radius.entity)
  )
}

export function cylinder(
  { radius, height }: { radius: Container, height: Container },
  options?: CylinderLabels) {
  const { radiusLabel, entity2D, entity3D, surfaceBaseAreaLabel, heightLabel, baseCircumferenceLabel, volumeLabel } = {
    ...{
      radiusLabel: "poloměr",
      entity2D: "čtverečků",
      entity3D: "krychliček",
      surfaceBaseAreaLabel: "obsah podstavy",
      baseCircumferenceLabel: "obvod podstavy",
      volumeLabel: "objem válce",
      heightLabel: "výška"
    },
    ...options ?? {}
  }

  const entity = radius.entity;

  const surfaceBaseAreaTree = surfaceBaseArea({ radius }, { entity2D, radiusLabel, surfaceBaseAreaLabel })

  const volume = deduce(
    surfaceBaseAreaTree,
    height,
    product(volumeLabel, [surfaceBaseAreaLabel, heightLabel], entity3D, entity)
  )

  const baseCircumferenceTree = baseCircumference({ radius }, { radiusLabel, baseCircumferenceLabel })

  const protilehlaStana = cont("počet stěn", 2, "");
  const surface = deduce(
    deduce(
      surfaceBaseAreaTree,
      protilehlaStana,
      product("spodní a horní stěna", [], entity2D, entity)
    ),
    deduce(
      baseCircumferenceTree,
      height,
      product("obsah bočního pláště", ["obvod podstavy", heightLabel], entity2D, entity)
    ),
    combine("obsah pláště", [], entity2D, entity2D)
  )

  return {
    volume,
    surface,
    baseCircumference: baseCircumferenceTree,
    surfaceBaseArea: surfaceBaseAreaTree
  }
}

export function surfaceBaseAreaIn({ input }: { input: TreeNode}, labels: CylinderLabels = {}) {
  return connectTo(surfaceBaseArea({ radius: last(input) }, labels), input);
}

export function volumeIn({ input, height }: { input: TreeNode, height: Container }, labels: CylinderLabels = {}) {
  return connectTo(cylinder({ radius: last(input), height }, labels).volume, input);
}
export function surfaceIn({ input, height }: { input: TreeNode, height: Container }, labels: CylinderLabels = {}) {
  return connectTo(cylinder({ radius: last(input), height }, labels).surface, input);
}

interface Params {
  radius: number
  height: number
}

export function examples({ input }: {
  input: Params,
}) {

  const radiusLabel = "poloměr"
  const heightLabel = "výška"
  const entity = "cm";

  const radius = axiomInput(cont(radiusLabel, input.radius, entity), 1);
  const height = axiomInput(cont(heightLabel, input.height, entity), 2);

  const dTree1 = surfaceBaseArea({ radius })

  const dTree2 = cylinder({radius, height }).volume;

  const dTree3 = cylinder({ radius, height }).surface;

  const templateBase = highlight => highlight
    `Válec, který má poloměr podstavy ${input.radius} cm a výšku ${input.height} cm.`

  const template1 = html => html`<br/>
    <strong>Vypočtěte obsah podstavy.</strong>`;

  const template2 = html => html`<br/>
    <strong>Vypočtěte objem válce.</strong>`;

  const template3 = html => html`<br/>
    <strong>Vypočtěte obsah pláště válce.</strong>`;


  return [
    { deductionTree: dTree1, template: highlight => highlight`${() => templateBase(highlight)}${template1}` },
    { deductionTree: dTree2, template: highlight => highlight`${() => templateBase(highlight)}${template2}` },
    { deductionTree: dTree3, template: highlight => highlight`${() => templateBase(highlight)}${template3}` },
  ]
}