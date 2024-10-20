
export function convertQueryParamToQuestions(value:string) {
  return isEmptyOrWhiteSpace(value) ? []: value.split("|").map(d => d.split(","))
}
export function convertQuestionToQueryParam(values:{code:string, id: string}[]){
  return Object.entries(Object.groupBy(values, ({code}) => code)).map(([code,values]) => [code].concat(values.map(d=> d.id)).join(",")).join("|");
}
export function isEmptyOrWhiteSpace(value: string | undefined) {
  return value == null || (typeof value === 'string' && value.trim() === '');
};

export function removeSpaces(value: string) {
  return value !=
    null ? value.replace(/\s+/g, '') : value
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export function replaceAll(str, find, replace) {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

export function convertFlagsToQueryParam(obj: Record<string, boolean>){
  return Object.entries(obj).map(([key,value]) => `${key}=${value}`).join('&')
}
