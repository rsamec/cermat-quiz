import { html } from "htl";

import { cont, compDiff, inferenceRule, rate, ratio, sum } from "../../components/math.js";
import { deduce } from "../../utils/deduce.js";
import { formatNode as format, inputLabel, deduceLabel, highlightLabel } from "../../utils/deduce-components.js";


interface PercentPartParams {
  zdravotnik: number;
  kucharPerZdravotnik: number;
  vedouciPerKuchar: number;
  instruktorPerVedouci: number;
  ditePerInstruktor: number;
}
export default function build({ input }: {
  input: PercentPartParams,
}) {

  const agent = "tabor";
  const zdravotniLabel = "zdravotník";
  const kucharLabel = "kuchařka";
  const vedouciLabel = "vedoucí";
  const instruktorLabel = "instruktor";
  const diteLabel = "dítě";
  const stanLabel = "stanLabel";
  const entity = "osob";


  const zdravotnik = cont(agent, input.zdravotnik, zdravotniLabel);
  const kucharPerZdravotnik = rate(agent, input.kucharPerZdravotnik, kucharLabel, zdravotniLabel);
  const vedouciPerKuchar = rate(agent, input.vedouciPerKuchar, vedouciLabel, kucharLabel);
  const instruktorPerVedouci = rate(agent, input.instruktorPerVedouci, instruktorLabel, vedouciLabel);
  const ditePerInstruktor = rate(agent, input.ditePerInstruktor, diteLabel, instruktorLabel);

  const dd1 = inferenceRule(zdravotnik, kucharPerZdravotnik) as any;
  const dd2 = inferenceRule(dd1, vedouciPerKuchar) as any;
  const dd3 = inferenceRule(dd2, instruktorPerVedouci) as any;


  const instruktorAVedouci = sum("vedoucích a instruktorů", [vedouciLabel, instruktorLabel], entity, entity);

  //const dd3 = inferenceRule([porucik, dd1, dd2], dostaneRozkazy)

  const ddBase = () => deduce(
    deduce(
      deduce(
        format(zdravotnik, inputLabel(1)),
        format(kucharPerZdravotnik, inputLabel(2)),
        format(dd1, deduceLabel(1))
      ),
      format(vedouciPerKuchar, inputLabel(3)),
      format(dd2, deduceLabel(2))
    ),
    format(instruktorPerVedouci, inputLabel(4)),
    format(dd3, deduceLabel(3))
  )

  const tree1dd4 = inferenceRule([dd3, dd2], instruktorAVedouci);
  const dTree1 = deduce(
    ddBase(),
    format(dd2, deduceLabel(2)),
    format(instruktorAVedouci),
    format(tree1dd4, deduceLabel(4))

  )

  const tree2dd4 = inferenceRule(
    { ...dd1, agent: dd1.entity, entity: 'osob' },
    { ...dd3, agent: dd3.entity, entity: 'osob' },
    { kind: 'comp-ratio' }
  );
  const dTree2 = deduce(
    format(dd1, deduceLabel(1)),
    ddBase(),
    format({kind:'comp-ratio'}),
    format(tree2dd4, deduceLabel(4))

  )

  const tree3dd4 = inferenceRule(dd3, ditePerInstruktor)
  const dTree3 = deduce(
    ddBase(),
    format(ditePerInstruktor, inputLabel(5)),
    format(tree3dd4, deduceLabel(4))
  )



  const templateBase = () => html`
  
  ${highlightLabel()`Na letním táboře jsou kromě dětí také instruktoři, vedoucí, kuchařky a ${input.zdravotnik} zdravotník.
     Počet zdravotníků a počet kuchařek je v poměru ${`1:${input.kucharPerZdravotnik}`},
     počet kuchařek a vedoucích ${`1:${input.vedouciPerKuchar}`},
     počet vedoucích a instruktorů ${`1:${input.instruktorPerVedouci}`},
     a počet instruktorů a dětí ${`1:${input.ditePerInstruktor}`}.
     Všichni jsou ubytováni ve stanech. Zdravotník je ve stanu sám, ostatní jsou ubytováni po dvou.`}`


  const template1 = html`${templateBase()}<br/>
     ${deduceLabel(4)}<strong>Na táboře je dohromady ${tree1dd4.kind == "cont" && tree1dd4.quantity} vedoucích a instruktorů?</strong>`;

  const template2 = html`${templateBase()}<br/>
     ${deduceLabel(4)}<strong>Instruktorů je ${tree2dd4.kind == "comp-ratio" && tree2dd4.quantity} krát více než kuchařek.?</strong>`;


  const template3 = html`${templateBase()}<br/>
    ${deduceLabel(4)}<strong>Na táboře je celkem ${tree3dd4.kind == "cont" && tree3dd4.quantity} dětí?</strong>`;

  return [
    { deductionTree: dTree1, template: template1 },
    { deductionTree: dTree2, template: template2 },
    { deductionTree: dTree3, template: template3 }
  ]
}