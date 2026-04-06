import { formatVersionByCode, formatCode as formFullCode } from "../utils/quiz-string-utils.js";
export function formatCode(code){
    return formFullCode(code)
}

export const baseUrl = "https://www.cermatdata.cz/cermat";
export const relativeBaseUrl = "/cermat";