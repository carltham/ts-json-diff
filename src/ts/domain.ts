//// GLOBAL CONSTANTS

// OPS
export enum OPS {
  ADD = "ADD",
  NONE = "NONE",
  REMOVE = "REMOVE",
}

// TYPES
export enum TYPES {
  ARRAY = "ARRAY",
  NULL = "NULL",
  OBJECT = "OBJECT",
  SCALAR = "SCALAR",
}

// OTHER
export enum OTHER {
  NON_RELEVANT_VALUE = "...",
}

//// OBJECTS
export class OBJECTS {
  key: any;
  value: any;
  op: any;
  valueType: any;
  topType: any;
  diff: any;
  leftError: any;
  rightError: any;

  static Diff(key, value, op, valueType): OBJECTS {
    const result = new OBJECTS();
    result.key = key;
    result.value = value;
    result.op = op;
    result.valueType = valueType;
    return result;
  }

  static TopDiff(type, diff) {
    const result = new OBJECTS();
    result.topType = type;
    result.diff = diff;
    return result;
  }
}

export class ValidationException extends Error {
  leftError: any;
  rightError: any;

  constructor(leftError: string, rightError: string = null) {
    super();
    this.leftError = leftError;
    this.rightError = rightError;
  }
}
