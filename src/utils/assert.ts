import { removeSpaces, isEmptyOrWhiteSpace } from "./string-utils.js"

export type Option<T> = { name: string, value: T }
export type ValidationFunctionArgs<T> = { args: T }
export type EqualValidator<T> = ValidationFunctionArgs<T> & {
  kind: "equal"
}

export type JsonRegExp = { source: string, flags: string }
export type MatchValidator = ValidationFunctionArgs<JsonRegExp> & {
  kind: "match"
}

export type EqualRatioValidator<T> = ValidationFunctionArgs<T> & {
  kind: "equalRatio"
}

export type EqualOptionValidator<T> = ValidationFunctionArgs<T> & {
  kind: "equalOption"
}
export type EqualMathOptionValidator = ValidationFunctionArgs<string | number> & {
  kind: "equalMathExpression"
}
export type EqualLatexExpressionValidator = ValidationFunctionArgs<string> & {
  kind: "equalLatexExpression"
}
export type EqualMathEquationValidator = ValidationFunctionArgs<string | boolean> & {
  kind: "equalMathEquation"
}

export type EqualSortedOptionsValidator = ValidationFunctionArgs<string[]> & {
  kind: "equalSortedOptions"
}
export type EqualStringCollectionValidator = ValidationFunctionArgs<string[]> & {
  kind: "equalStringCollection"
}
export type EqualNumberCollectionValidator = ValidationFunctionArgs<number[]> & {
  kind: "equalNumberCollection"
}


export type SelfEvaluateText = {
  kind: 'text',
  content: string
}

export type SelfEvaluateImage = {
  kind: 'image'
  src: string
}

export type SelfEvaluateValidator = ValidationFunctionArgs<{ options: Option<number>[], hint: SelfEvaluateText | SelfEvaluateImage }> & {
  kind: "selfEvaluate"
}
export type ValidationFunctionSpec<T> = EqualValidator<T> | EqualRatioValidator<T> | EqualOptionValidator<T> | SelfEvaluateValidator | EqualMathOptionValidator
  | EqualMathEquationValidator | EqualStringCollectionValidator | EqualNumberCollectionValidator | EqualSortedOptionsValidator | MatchValidator | EqualLatexExpressionValidator;

export class CoreVerifyiers {
  static EqualTo<T>(value: T) {
    return (control: T) => {
      return control === value || areDeeplyEqual(control, value) ? undefined : { 'expected': value, 'actual': control, errorCount: null };
    }
  }

  static MatchTo(pattern: JsonRegExp) {
    const regex = new RegExp(pattern.source,pattern.flags);
    return (control: string) => {
      return regex.test(control) ? undefined : { 'expected': pattern, 'actual': control, errorCount: null };
    }
  }

  static RatioEqualTo<T>(value: T) {
    return (control: T) => {
      return typeof control === 'string' && removeSpaces(control) === value ? undefined : { 'expected': value, 'actual': control, errorCount: null };
    }
  }

  static MathExpressionEqualTo(value: string | number) {
    return (control: string) => {
      return simplifyExpression(control) === value ? undefined : { 'expected': value, 'actual': control, errorCount: null };
    }
  }

  static MathEquationEqualTo(value: string | boolean) {
    return (control: string | boolean) => {
      if (typeof value === 'boolean') {
        return value === control ? undefined : { 'expected': value, 'actual': control, errorCount: null };
      }
      else {
        const controlValue = simplifyExpression(control?.toString());
        return value === removeSpaces(controlValue) ? undefined : { 'expected': value, 'actual': control, errorCount: null };
      }
    }
  }

  static OptionEqualTo<T>(value: T) {
    return (control: Option<T>) => {
      return control?.value === value || (value === true && control?.value === 'A') || (value === false && control?.value === 'N') ? undefined : { 'expected': value, 'actual': control, errorCount: null }
    }
  }

  static EqualStringCollectionTo(value: string[]) {
    return (control: string[] | string) => {
      const controlValue = normalizeToArray(control).map(d => d?.trim())
      const errorCount = controlValue.length - intersection(controlValue, value) + Math.max(value.length - controlValue.length, 0);
      return errorCount === 0 ? undefined : { 'expected': value, 'actual': controlValue, errorCount }
    }
  }

  static EqualNumberCollectionTo(value: number[]) {
    return (control: number[] | string) => {
      const controlValue = normalizeToArray(control).map(d => parseInt(d));
      const errorCount = Array.isArray(controlValue) ? controlValue.length - intersection(controlValue, value) + Math.max(value.length - controlValue.length, 0) : null;
      return Array.isArray(controlValue) && errorCount === 0 ? undefined : { 'expected': value, 'actual': controlValue, errorCount }
    }
  }


  static SortedOptionsEqualTo(values: string[]) {
    return (control: Option<string>[] | string[] | string) => {
      const options = normalizeToArray(control);      
      return Array.isArray(options) && values.length === options.length && values.join() === options.map((d:any) => d.value ?? d).map(d => d?.trim()).join() ? undefined :
        { 'expected': values, 'actual': options, errorCount: null }      
    }
  }

  static SelfEvaluateTo({ options }: { options: Option<number>[] }) {
    return (control: Option<number>) => {
      return options[options.length - 1].value == control?.value ? null : { expected: options, actual: control, errorCount: null }
    }
  }
}


export function getVerifyFunction<T>(spec: ValidationFunctionSpec<T>)
//: (values: any) => ({ expected: any, actual: any } | undefined)
{
  switch (spec.kind) {
    case 'equal':
    case 'equalLatexExpression':
      return CoreVerifyiers.EqualTo(spec.args);
    case 'match':
      return CoreVerifyiers.MatchTo(spec.args);
    case 'equalRatio':
      return CoreVerifyiers.RatioEqualTo(spec.args);
    case 'equalStringCollection':
      return CoreVerifyiers.EqualStringCollectionTo(spec.args);
    case 'equalNumberCollection':
      return CoreVerifyiers.EqualNumberCollectionTo(spec.args);
    case 'equalMathExpression':
      return CoreVerifyiers.MathExpressionEqualTo(spec.args);
    case 'equalMathEquation':
      return CoreVerifyiers.MathEquationEqualTo(spec.args);
    case 'equalOption':
      return CoreVerifyiers.OptionEqualTo(spec.args);
    case 'selfEvaluate':
      return CoreVerifyiers.SelfEvaluateTo(spec.args);
    case 'equalSortedOptions':
      return CoreVerifyiers.SortedOptionsEqualTo(spec.args);
    default:
      throw new Error(`Function ${spec} not supported.`);
  }
}

function intersection<T>(arr1: T[], arr2: T[]) {
  // Use Set to eliminate duplicates and filter to find common elements
  const set1 = new Set(arr1);
  const set2 = new Set(arr2);

  // Find the intersection by checking if elements of one set are in the other
  const intersection = Array.from(set1).filter(item => set2.has(item));

  return intersection.length;
}
function normalizeToArray(value: string | any[]) {
  return Array.isArray(value)
    ? value
    : isEmptyOrWhiteSpace(value)
      ? []
      : value.split(",")
}
function areDeeplyEqual(obj1: any, obj2: any): boolean {
  
    // Base case: If both objects are identical, return true.
    if (obj1 === obj2) {
      return true;
    }
    // Check if both objects are objects and not null.
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
      return false;
    }
    // Get the keys of both objects.
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    // Check if the number of keys is the same.
    if (keys1.length !== keys2.length) {
      return false;
    }
    // Iterate through the keys and compare their values recursively.
    for (const key of keys1) {
      if (!keys2.includes(key) || !areDeeplyEqual(obj1[key], obj2[key])) {
        return false;
      }
    }
    // If all checks pass, the objects are deep equal.
    return true;
  
}
function simplifyExpression(value: string){
  //@todo simplify math expression
  return value;
}