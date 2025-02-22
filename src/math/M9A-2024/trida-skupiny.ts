
import { cont, compDiff, sum, commonSense } from "../../components/math.js";
import { axiomInput, deduce, to } from "../../utils/deduce-utils.js";


interface Params {
  chlapci: number;
  anglictinaChlapci: number;
  nemcinaDivky: number;
}
export default function build({ input }: {
  input: Params,
}) {
  const skupinaEN = "angličtina celkem"
  const skupinaDE = "němčina"

  const celkemAgent = "chlapců celkem"
  const entityChlapci = "chlapci"
  const entityDivky = "dívky"
  const entity = ""


  const chlapci = axiomInput(cont(celkemAgent, input.chlapci, entityChlapci), 1);
  const chlapciDiff  = axiomInput(compDiff(celkemAgent, skupinaDE, input.anglictinaChlapci, entityChlapci),2)
  const de = axiomInput(cont(skupinaDE, input.nemcinaDivky, entityDivky), 3);


  //const data = [{ value: halfTotal, agent: skupinaDE }, { value: halfTotal, agent: skupinaDE }, { value: input.jihlavaPlus, agent: jihlava, opacity: 0.6, }]
  const dBase = deduce(
    deduce(chlapci,
      chlapciDiff
    ),
    de,
    sum(skupinaDE, [], entity, entity)
  )

  const dTree1 =
    deduce(
      to(
        dBase,
        commonSense("angličtina a němčina - stejný počet žáků"),
        cont(skupinaEN, (input.chlapci - input.anglictinaChlapci) + input.nemcinaDivky, entity)
      ),
      compDiff(skupinaEN, entityDivky, input.anglictinaChlapci, entity)
    )


  const dTree2 =
  to(
    dBase,
    commonSense("angličtina a němčina - stejný počet žáků"),
    cont("třída", ((input.chlapci - input.anglictinaChlapci) + input.nemcinaDivky) * 2, entity)
  )


  const templateBase = highlight => highlight
    `Žáci třídy 8.B se dělí na dvě skupiny podle toho, zda chodí na němčinu nebo angličtinu.
     V obou skupinách je stejný počet žáků. Ve třídě je ${input.chlapci} chlapců a ${input.anglictinaChlapci} z nich chodí na angličtinu.
    Na němčinu chodí ${input.nemcinaDivky} dívky.`

  const template1 = html => html`<br/>
    <strong>Kolik dívek celkem chodí na angličtinu?</strong>`;

  const template2 = html => html`<br/>
    <strong>Kolik má třída 8.B celkem žáků?</strong>`;

  return [
    { deductionTree: dTree1, template: highlight => highlight`${() => templateBase(highlight)}${template1}` },
    { deductionTree: dTree2, template: highlight => highlight`${() => templateBase(highlight)}${template2}` }
  ]
}