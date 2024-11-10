import { forkJoin } from "../utils/common-utils.js";
import { quizes } from "../utils/quiz-utils.js";
import { normalizeImageUrlsToAbsoluteUrls } from "../utils/quiz-string-utils.js";


const codesAndUrl = quizes.flatMap(d => d.codes.map(
  (code) => [
    code,
    `https://www.eforms.cz/${d.subject}/${d.period}/${code}`]
));
forkJoin(
  codesAndUrl.map(([_, mdBaseUrl]) =>
    fetch(`${mdBaseUrl}/index.md`).then((d) => {
      try {
        return d.ok ? d.text() : Promise.resolve('')
      }
      catch (e) {
        console.error(e)
        return ''
      }
    }))
).then(results => {  
  return results.map((md, i) => {
    const rawContent = normalizeImageUrlsToAbsoluteUrls(md, [codesAndUrl[i][1]]);
    return [codesAndUrl[i][0],rawContent]
  }
  )
}).then(entries => {
  process.stdout.write(JSON.stringify(Object.fromEntries(entries)))
}
)

