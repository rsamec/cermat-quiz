
import { cont } from "../../components/math.js";
import { axiomInput, deduce } from "../../utils/deduce-utils.js";
import { cylinder } from "../shapes/cylinder.js"

interface BaseParams {
  radius: number,
  height: number,
}

interface Params {
  out: BaseParams
  in: BaseParams
}

export default function build({ input }: {
  input: Params,
}) {

  const agentOut = "vnější válec";
  const agentIn = "vnitřní válec";
  const entity = "cm"


  const outRadius = axiomInput(cont(`${agentOut} poloměr`, input.out.radius, entity), 1);
  const outHeight = axiomInput(cont(`${agentOut} výška`, input.out.height, entity), 2)
  const inRadius = axiomInput(cont(`${agentIn} poloměr`, input.in.radius, entity), 3);
  const inHeight = axiomInput(cont(`${agentIn} výška`, input.in.height, entity), 4);

  const outCylinder = cylinder({ radius: outRadius, height: outHeight });
  const inCylinder = cylinder({ radius: inRadius, height: inHeight });


  const deductionTree = deduce(
    outCylinder.volume,
    inCylinder.volume,
  )

  const template = highlight => highlight`
  Skleněné těžítko má tvar rotačního válce s plolměrem podstavy ${input.out.radius} cm a výškou ${input.out.height} cm.
  Vnější část těžítka je z čirého skla, uvnitř je část z modrého skla,
  která má také tavr rotačního válce, a to s poloměrem podstavy ${input.in.radius} cm a výškou ${input.in.height} cm.
  ${html => html`
    <br /> 
    Vypočítejte objem čirého skla v těžítku. Výsledek zaokrouhlete na desítky cm <sup>3</sup>.`}`;

  return { deductionTree, template }
}