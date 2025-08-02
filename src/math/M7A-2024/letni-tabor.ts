
import { cont, rate, ctor, type RatioComparison, ctorBooleanOption, accumulate } from "../../components/math";
import { axiomInput, deduce, last } from "../../utils/deduce-utils";


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
  const entity = "osob";


  const zdravotnik = axiomInput(cont(agent, input.zdravotnik, zdravotniLabel), 1);
  const kucharPerZdravotnik = axiomInput(rate(agent, input.kucharPerZdravotnik, kucharLabel, zdravotniLabel), 2);
  const vedouciPerKuchar = axiomInput(rate(agent, input.vedouciPerKuchar, vedouciLabel, kucharLabel), 3);
  const instruktorPerVedouci = axiomInput(rate(agent, input.instruktorPerVedouci, instruktorLabel, vedouciLabel), 4);
  const ditePerInstruktor = axiomInput(rate(agent, input.ditePerInstruktor, diteLabel, instruktorLabel), 5);



  const kuchari = deduce(
    zdravotnik,
    kucharPerZdravotnik,
  )
  const vedouci = deduce(
    kuchari,
    vedouciPerKuchar,
  )
  const instruktori = deduce(
    vedouci,
    instruktorPerVedouci,
  )

  const dTree1 = deduce(
    instruktori,
    last(vedouci),
    accumulate("vedoucích a instruktorů")
  )
  const dTree1Result = last(dTree1);

  const dTree2 = deduce(
    instruktori,
    last(kuchari),
    ctor('comp-ratio')
  )
  const dTree2Result = last(dTree2) as unknown as RatioComparison;


  const dTree3 = deduce(
    instruktori,
    ditePerInstruktor,
  )
  const dTree3Result = last(dTree3);


  const templateBase = (highlight) =>
    highlight`Na letním táboře jsou kromě dětí také instruktoři, vedoucí, kuchařky a ${input.zdravotnik} zdravotník.
     Počet zdravotníků a počet kuchařek je v poměru ${`1:${input.kucharPerZdravotnik}`},
     počet kuchařek a vedoucích ${`1:${input.vedouciPerKuchar}`},
     počet vedoucích a instruktorů ${`1:${input.instruktorPerVedouci}`},
     a počet instruktorů a dětí ${`1:${input.ditePerInstruktor}`}.
     Všichni jsou ubytováni ve stanech. Zdravotník je ve stanu sám, ostatní jsou ubytováni po dvou.`


  const template1 = (html) => html`<br/>
     <strong>Na táboře je dohromady ${dTree1Result.quantity} vedoucích a instruktorů?</strong>`;

  const template2 = (html) => html`<br/>
     <strong>Instruktorů je ${dTree2Result.ratio} krát více než kuchařek.?</strong>`;


  const template3 = (html) => html`<br/>
    <strong>Na táboře je celkem ${dTree3Result.quantity} dětí?</strong>`;

  return {
    pocetVedoucichAInstruktoru: { deductionTree: deduce(dTree1, ctorBooleanOption(22)), template: highlight => highlight`${() => templateBase(highlight)}${template1}` },
    porovnaniInstrukturuAKucharek: { deductionTree: deduce(dTree2, ctorBooleanOption(4)), template: highlight => highlight`${() => templateBase(highlight)}${template2}` },
    pocetDeti: { deductionTree: deduce(dTree3, ctorBooleanOption(64)), template: highlight => highlight`${() => templateBase(highlight)}${template3}` },
  }
}