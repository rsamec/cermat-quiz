import { html } from "htl";
import { cont, inferenceRule, ratio, diff, comp, rate } from "../utils/math.js";
import { deduce} from "../utils/deduce.js";
import { formatNode as format, inputLabel, deduceLabel, outputLabel, highlight } from "../utils/deduce-components.js";

interface ZvirataVOhradeParams {
  pocetHlav: number;
  kralikuMene: number;
}
export default function build({ input }: {
  input: ZvirataVOhradeParams,
}) {
  const rozdil = input.pocetHlav - input.kralikuMene;
  const halfTotal = Math.round(rozdil / 2)

  const nohy = (halfTotal + input.kralikuMene) * 2 + (halfTotal * 4);
  const data = [
    { value: halfTotal, agent: 'králíci' },
    { value: halfTotal, agent: 'slepice' },
    { value: input.kralikuMene, agent: 'slepice', opacity: 0.6, }
  ]

  const hlava = "hlava";
  const celkem = 'slepice a králíci';
  const partCelkem = "zbytek";
  const entity = "zvíře";


  const slepice = "slepice";
  const kralik = "králík";

  const total = cont(celkem, input.pocetHlav,hlava)
  const perHlava = rate(celkem, 1, hlava, entity);
  const plus = diff(celkem, partCelkem, input.kralikuMene, entity)
  const pomer = ratio(partCelkem, kralik, 1 / 2);
  const slepicePlus = comp(kralik,slepice,-input.kralikuMene, entity)

  const dd1 = inferenceRule(total, perHlava)
  const dd2 = inferenceRule(dd1, plus);
  const dd3 = inferenceRule(dd2, pomer, { kind: 'ratio' });
  const dd4 = inferenceRule(dd3, slepicePlus);
  const deductionTree = deduce(
    deduce(
      deduce(
        deduce(format(total, inputLabel(1)), format(perHlava),format(dd1, deduceLabel(1))),
        format(plus, inputLabel(2)),
        format(dd2, deduceLabel(2))
      ),
      format(pomer),
      format(dd3, deduceLabel(3)),
    ),
    format(slepicePlus, inputLabel(2)),
    format(dd4, outputLabel(4)),
  )

  const template = html`
  ${inputLabel(1)}${highlight`V ohradě pobíhali králíci a slepice.`}
  ${inputLabel(2)}${highlight`Králíků bylo o ${input.kralikuMene} méně.`}
  ${inputLabel(3)}${highlight`Králíci a slepice měli dohromady ${nohy} nohou a ${input.pocetHlav} hlav.`}<br/>
  ${outputLabel(4)}<strong> Kolik bylo v ohradě slepic?</strong>`;

  return { deductionTree, data, template }
}