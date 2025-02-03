import {Example}  from '../../baml-client.cjs'

console.log(Example);
const result = await Example("Roman Samec, programmer, Pwc");
process.stdout.write(JSON.stringify(result, null, 2));
