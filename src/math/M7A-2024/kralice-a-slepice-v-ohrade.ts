
import { cont, comp, rate, ctor } from "../../components/math.js";
import { axiomInput, deduce } from "../../utils/deduce-utils.js";

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

  const entity = "zvíře";


  const slepice = "slepice";
  const kralik = "králík";

  const total = axiomInput(cont(celkem, input.pocetHlav, hlava), 1)
  const perHlava = rate(celkem, 1, hlava, entity);
  const slepicePlus = axiomInput(comp(kralik, slepice, -input.kralikuMene, entity), 2)

  const deductionTree = deduce(
    deduce(
      deduce(total, perHlava),
      slepicePlus,
      ctor('comp-part-eq'),
    ),
    slepicePlus
  )

  const template = highlight => highlight`V ohradě pobíhali králíci a slepice.
  Králíků bylo o ${input.kralikuMene} méně.
  Králíci a slepice měli dohromady ${nohy} nohou a ${input.pocetHlav} hlav.
  ${html => html`<br/><strong> Kolik bylo v ohradě slepic?</strong>`}`

  return { deductionTree, data, template }
}
