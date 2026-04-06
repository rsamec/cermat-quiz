
import { execSync } from "node:child_process";

const subjects = ["math", "cz", "en", "de"];
const allPeriods = ['4','6', '8', 'diploma']

subjects.forEach(subject => {
    const periods = subjects == "math" || subjects == "cz" ? allPeriods: ['diploma']
    periods.forEach(period => {
        const cmd = `node ./src/cermat/pdf-[subject]-[period].json.js --subject ${subject} --period ${period}`;
        console.log(`\n▶ Running: ${cmd}`);

        const output = execSync(cmd, {
            encoding: "utf8",
        });
        console.log(`\n▶ Result: ${output}`);

    });  
});