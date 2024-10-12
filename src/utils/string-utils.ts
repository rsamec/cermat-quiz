
export function convertQueryParamToQuestions(value:string) {
  return isEmptyOrWhiteSpace(value) ? []: value.split("|").map(d => d.split(","))
}

export function isEmptyOrWhiteSpace(value: string | undefined) {
  return value == null || (typeof value === 'string' && value.trim() === '');
};

export function removeSpaces(value: string) {
  return value !=
    null ? value.replace(/\s+/g, '') : value
}


export function convertFlagsToQueryParam(obj: Record<string, boolean>){
  return Object.entries(obj).map(([key,value]) => `${key}=${value}`).join('&')
}
