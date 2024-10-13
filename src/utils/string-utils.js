export function convertQueryParamToQuestions(value) {
    return isEmptyOrWhiteSpace(value) ? [] : value.split("|").map(d => d.split(","));
}
export function isEmptyOrWhiteSpace(value) {
    return value == null || (typeof value === 'string' && value.trim() === '');
}
;
export function removeSpaces(value) {
    return value !=
        null ? value.replace(/\s+/g, '') : value;
}
export function convertFlagsToQueryParam(obj) {
    return Object.entries(obj).map(([key, value]) => `${key}=${value}`).join('&');
}
