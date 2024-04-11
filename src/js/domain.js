//// GLOBAL CONSTANTS

// OPS
const OPS = {
  ADD: "ADD",
  NONE: "NONE",
  REMOVE: "REMOVE",
};

// TYPES
const TYPES = {
  ARRAY: "ARRAY",
  NULL: "NULL",
  OBJECT: "OBJECT",
  SCALAR: "SCALAR",
};

// OTHER
const OTHER = {
  NON_RELEVANT_VALUE: "...",
};

//// OBJECTS
class OBJECTS {

  Diff = ( key, value, op, valueType ) => {
    this.key = key;
    this.value = value;
    this.op = op;
    this.valueType = valueType;
    return this;
  };

  TopDiff = ( type, diff ) => {
    this.topType = type;
    this.diff = diff;
    return this;
  };
};

function ValidationException( leftError, rightError ) {
  this.leftError = leftError;
  this.rightError = rightError;
}
exports.ValidationException = ValidationException;
exports.OPS = OPS;
exports.TYPES = TYPES;
exports.OTHER = OTHER;
exports.OBJECTS = OBJECTS;