import { parseArgs } from "node:util";

const {
  values: { code }
} = parseArgs({
  options: { code: { type: "string" }}
});


async function json(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
  return await response.json();
}
const metadata = await json(`https://raw.githubusercontent.com/rsamec/cermat/refs/heads/main/generated/${code}.json`)
process.stdout.write(JSON.stringify(metadata));