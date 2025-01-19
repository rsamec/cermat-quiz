
import { cont, inferenceRule, rate, sum, ctor } from "../../components/math.js";
import { axiomInput, deduce, deduceLbl, to } from "../../utils/deduce-utils.js";


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


  const zdravotnik = axiomInput(cont(agent, input.zdravotnik, zdravotniLabel), 1);
  const kucharPerZdravotnik = axiomInput(rate(agent, input.kucharPerZdravotnik, kucharLabel, zdravotniLabel), 2);
  const vedouciPerKuchar = axiomInput(rate(agent, input.vedouciPerKuchar, vedouciLabel, kucharLabel), 3);
  const instruktorPerVedouci = axiomInput(rate(agent, input.instruktorPerVedouci, instruktorLabel, vedouciLabel), 4);
  const ditePerInstruktor = axiomInput(rate(agent, input.ditePerInstruktor, diteLabel, instruktorLabel), 5);

  const dd1 = inferenceRule(zdravotnik, kucharPerZdravotnik) as any;
  const dd2 = inferenceRule(dd1, vedouciPerKuchar) as any;
  const dd3 = inferenceRule(dd2, instruktorPerVedouci) as any;


  const instruktorAVedouci = sum("vedoucích a instruktorů", [vedouciLabel, instruktorLabel], entity, entity);


  const ddBase = () => deduce(
    deduce(
      deduce(
        zdravotnik,
        kucharPerZdravotnik,
      ),
      vedouciPerKuchar,
    ),
    instruktorPerVedouci,
  )

  const tree1dd4 = inferenceRule(dd3, dd2, instruktorAVedouci);
  const dTree1 = deduce(
    ddBase(),
    { ...dd2, ...deduceLbl(2) },
    instruktorAVedouci)



  const tree2dd4 = inferenceRule(
    { ...dd1, entity: 'osob' },
    { ...dd3, entity: 'osob' },
    ctor('comp-ratio')
  );
  const dTree2 = to(
    {...dd1, ...deduceLbl(1)},
    ddBase(),
    tree2dd4,

  )

  const tree3dd4 = inferenceRule(dd3, ditePerInstruktor)
  const dTree3 = deduce(
    ddBase(),
    ditePerInstruktor,
  )



  const templateBase = (highlight) =>
    highlight`Na letním táboře jsou kromě dětí také instruktoři, vedoucí, kuchařky a ${input.zdravotnik} zdravotník.
     Počet zdravotníků a počet kuchařek je v poměru ${`1:${input.kucharPerZdravotnik}`},
     počet kuchařek a vedoucích ${`1:${input.vedouciPerKuchar}`},
     počet vedoucích a instruktorů ${`1:${input.instruktorPerVedouci}`},
     a počet instruktorů a dětí ${`1:${input.ditePerInstruktor}`}.
     Všichni jsou ubytováni ve stanech. Zdravotník je ve stanu sám, ostatní jsou ubytováni po dvou.`


  const template1 = (html) => html`<br/>
     <strong>Na táboře je dohromady ${tree1dd4.kind == "cont" && tree1dd4.quantity} vedoucích a instruktorů?</strong>`;

  const template2 = (html) => html`<br/>
     <strong>Instruktorů je ${tree2dd4.kind == "comp-ratio" && tree2dd4.quantity} krát více než kuchařek.?</strong>`;


  const template3 = (html) => html`<br/>
    <strong>Na táboře je celkem ${tree3dd4.kind == "cont" && tree3dd4.quantity} dětí?</strong>`;

  return [
    { deductionTree: dTree1, template: highlight => highlight`${() => templateBase(highlight)}${template1}` },
    { deductionTree: dTree2, template: highlight => highlight`${() => templateBase(highlight)}${template2}` },
    { deductionTree: dTree3, template: highlight => highlight`${() => templateBase(highlight)}${template3}` },
  ]
}