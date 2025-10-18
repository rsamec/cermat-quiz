
import { contLength, cylinderVolume } from "../../components/math";
import { axiomInput, deduce } from "../../utils/deduce-utils";

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

  const agentOut = "čiré sklo";
  const agentIn = "modré sklo";


  const outRadius = axiomInput(contLength(`${agentOut} podstava poloměr`, input.out.radius), 1);
  const outHeight = axiomInput(contLength(`${agentOut} válec výška`, input.out.height), 2)
  const inRadius = axiomInput(contLength(`${agentIn} podstava poloměr`, input.in.radius), 3);
  const inHeight = axiomInput(contLength(`${agentIn} válec výška`, input.in.height), 4);

  const outCylinder = deduce(outRadius, outHeight, cylinderVolume(`${agentOut} objem`));
  const inCylinder = deduce(inRadius, inHeight, cylinderVolume(`${agentIn} objem`));


  const deductionTree = deduce(
    outCylinder,
    inCylinder
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