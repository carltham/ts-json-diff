const { TYPES, OBJECTS, OPS, OTHER } = require( "./domain" );



function ComparingKeyAndValueStrategy() {
  this.getScalarsDiff = function ( leftKey, leftValue, rightKey, rightValue ) {
    var result = [];
    if ( leftValue !== rightValue ) {
      result.push( new OBJECTS().Diff( leftKey, leftValue, OPS.ADD, TYPES.SCALAR ), new OBJECTS().Diff( rightKey, rightValue, OPS.REMOVE, TYPES.SCALAR ) );
    } else {
      result.push( new OBJECTS().Diff( leftKey, leftValue, OPS.NONE, TYPES.SCALAR ) );
    }
    return result;
  };

  this.createDiff = function ( key, value, op, valueType ) {
    return new OBJECTS().Diff( key, value, op, valueType );
  };

  this.createDiffForDifferentTypes = function ( key, leftValue, leftOp, leftValType, rightValue, rightOp, rightValType ) {
    return [this.createDiff( key, leftValue, leftOp, leftValType ), this.createDiff( key, rightValue, rightOp, rightValType )];
  };
}

function ComparingKeyStrategy() {
  this.getScalarsDiff = function ( leftKey, leftValue, rightKey, rightValue ) {
    var result = [];
    if ( leftKey !== null ) {
      if ( leftKey !== rightKey ) {
        result.push( new OBJECTS().Diff( leftKey, OTHER.NON_RELEVANT_VALUE, OPS.ADD, TYPES.SCALAR ), new OBJECTS().Diff( rightKey, OTHER.NON_RELEVANT_VALUE, OPS.REMOVE, TYPES.SCALAR ) );
      } else {
        result.push( new OBJECTS().Diff( leftKey, OTHER.NON_RELEVANT_VALUE, OPS.NONE, TYPES.SCALAR ) );
      }
    } else {
      result.push( new OBJECTS().Diff( null, OTHER.NON_RELEVANT_VALUE, OPS.NONE, TYPES.SCALAR ) );
    }
    return result;
  };

  this.createDiff = function ( key, value, op, valueType ) {
    if ( valueType === TYPES.SCALAR ) return new OBJECTS().Diff( key, OTHER.NON_RELEVANT_VALUE, op, valueType );
    if ( key === null && op !== OPS.NONE ) return new OBJECTS().Diff( key, OTHER.NON_RELEVANT_VALUE, OPS.NONE, TYPES.SCALAR );
    if ( key !== null && op !== OPS.NONE ) return new OBJECTS().Diff( key, OTHER.NON_RELEVANT_VALUE, op, TYPES.SCALAR );
    return new OBJECTS().Diff( key, value, op, valueType );
  };

  this.createDiffForDifferentTypes = function ( key, leftValue, leftOp, leftValType, rightValue, rightOp, rightValType ) {
    return [this.createDiff( key, OTHER.NON_RELEVANT_VALUE, OPS.NONE, TYPES.SCALAR )];
  };
}

//// MAIN FUNCTION
function getDiffRepresentation( left, right, strategy ) {

  function _getType( v ) {
    if ( v === null ) return TYPES.NULL;
    var type = typeof ( v );
    if ( type === 'number' || type === 'string' || type === 'boolean' ) return TYPES.SCALAR;
    if ( type === 'object' ) {
      if ( v.constructor === Array ) return TYPES.ARRAY;
      else return TYPES.OBJECT;
    }
  }

  function _getInDepthDiff( json, op ) {
    var type = _getType( json );
    if ( type === TYPES.OBJECT ) return _getInDepthJsonDiff( json, op );
    else if ( type === TYPES.ARRAY ) return _getInDepthArrayDiff( json, op );
    else return json;
  }

  function _getInDepthArrayDiff( json, op ) {
    var result = [];
    for ( var i = 0; i < json.length; i++ ) {
      var value = json[i];
      var valueType = _getType( value );
      if ( valueType === TYPES.SCALAR ) {
        result.push( strategy.createDiff( null, value, op, TYPES.SCALAR ) );
      } else if ( valueType === TYPES.OBJECT ) {
        result.push( strategy.createDiff( null, _getInDepthJsonDiff( value, op ), op, TYPES.OBJECT ) );
      } else {
        result.push( strategy.createDiff( null, _getInDepthArrayDiff( value, op ), op, TYPES.ARRAY ) );
      }
    }
    return result;
  }

  function _getInDepthJsonDiff( json, op ) {
    var result = [];

    for ( var key in json ) {
      var value = json[key];
      var valueType = _getType( value );
      if ( valueType === TYPES.SCALAR ) {
        result.push( strategy.createDiff( key, value, op, TYPES.SCALAR ) );
      } else if ( valueType === TYPES.OBJECT ) {
        result.push( strategy.createDiff( key, _getInDepthJsonDiff( value, op ), op, TYPES.OBJECT ) );
      } else {
        result.push( strategy.createDiff( key, _getInDepthArrayDiff( value, op ), op, TYPES.ARRAY ) );
      }
    }
    result.sort( _sortByKeyAndOp );
    return result;
  }

  function _getArraysDiff( left, right ) {
    var result = [];
    var minLength = Math.min( left.length, right.length );
    for ( var i = 0; i < minLength; i++ ) {
      var leftType = _getType( left[i] );
      var rightType = _getType( right[i] );
      if ( leftType === rightType ) {
        if ( leftType === TYPES.SCALAR ) {
          result = result.concat( strategy.getScalarsDiff( null, left[i], null, right[i] ) );
        } else if ( leftType === TYPES.OBJECT ) {
          result.push( strategy.createDiff( null, _getJsonsDiff( left[i], right[i] ), OPS.NONE, TYPES.OBJECT ) );
        } else if ( leftType === TYPES.ARRAY ) {
          result.push( strategy.createDiff( null, _getArraysDiff( left[i], right[i] ), OPS.NONE, TYPES.ARRAY ) );
        } else {
          result.push( strategy.createDiff( null, null, OPS.NONE, TYPES.NULL ) );
        }
      } else {
        result = result.concat( strategy.createDiffForDifferentTypes(
          null, _getInDepthDiff( left[i], OPS.ADD ), OPS.ADD, leftType, _getInDepthDiff( right[i], OPS.REMOVE ), OPS.REMOVE, rightType ) );
      }
    }

    var excessArrayInfo = left.length < right.length ? { "array": right, "operation": OPS.REMOVE } : { "array": left, "operation": OPS.ADD };
    for ( var i = minLength; i < excessArrayInfo["array"].length; i++ ) {
      var val = excessArrayInfo["array"][i];
      var op = excessArrayInfo["operation"];
      result.push( strategy.createDiff( null, _getInDepthDiff( val, op ), op, _getType( val ) ) );
    }

    return result;
  }

  function _getJsonsDiff( left, right ) {
    var result = [];

    for ( var key in left ) {
      if ( !right.hasOwnProperty( key ) ) result.push( strategy.createDiff( key, _getInDepthDiff( left[key], OPS.ADD ), OPS.ADD, _getType( left[key] ) ) );
      else {
        var leftType = _getType( left[key] );
        var rightType = _getType( right[key] );
        if ( leftType === rightType ) {
          if ( leftType === TYPES.SCALAR ) {
            result = result.concat( strategy.getScalarsDiff( key, left[key], key, right[key] ) );
          } else if ( leftType === TYPES.OBJECT ) {
            result.push( strategy.createDiff( key, _getJsonsDiff( left[key], right[key] ), OPS.NONE, TYPES.OBJECT ) );
          } else if ( leftType == TYPES.ARRAY ) {
            result.push( strategy.createDiff( key, _getArraysDiff( left[key], right[key] ), OPS.NONE, TYPES.ARRAY ) );
          } else {
            result.push( strategy.createDiff( key, null, OPS.NONE, TYPES.NULL ) );
          }
        } else {
          result = result.concat( strategy.createDiffForDifferentTypes(
            key, _getInDepthDiff( left[key], OPS.ADD ), OPS.ADD, leftType, _getInDepthDiff( right[key], OPS.REMOVE ), OPS.REMOVE, rightType ) );
        }
      }
    }

    for ( var key in right ) {
      if ( !left.hasOwnProperty( key ) ) {
        result.push( strategy.createDiff( key, _getInDepthDiff( right[key], OPS.REMOVE ), OPS.REMOVE, _getType( right[key] ) ) );
      }
    }

    result.sort( _sortByKeyAndOp );
    return result;
  }

  function _sortByKeyAndOp( a, b ) {
    if ( a.key === b.key ) return ( a.op === OPS.ADD ) ? -1 : ( a.op === OPS.REMOVE ) ? 1 : 0;
    return a.key > b.key ? 1 : ( b.key > a.key ) ? -1 : 0;
  }

  function _parseJson( input ) {
    var parsedJson = null;
    try {
      parsedJson = JSON.parse( input );
    } catch ( err ) {
      return { "json": null, "exception": "Input is not a valid JSON" };
    }

    var jsonType = _getType( parsedJson );
    return jsonType === TYPES.ARRAY || jsonType === TYPES.OBJECT ?
      { "json": parsedJson, "exception": null } : { "json": parsedJson, "exception": "Input is not a valid JSON" };
  }

  strategy = typeof strategy !== 'undefined' ? strategy : new ComparingKeyAndValueStrategy();

  var leftParseResult = _parseJson( left );
  var rightParseResult = _parseJson( right );

  if ( leftParseResult["exception"] !== null || rightParseResult["exception"] !== null )
    throw new ValidationException( leftParseResult["exception"], rightParseResult["exception"] );

  var leftJson = leftParseResult["json"]; var rightJson = rightParseResult["json"];
  var leftJsonType = _getType( leftParseResult["json"] ); var rightJsonType = _getType( rightParseResult["json"] );

  if ( leftJsonType === TYPES.ARRAY && rightJsonType === TYPES.ARRAY ) return new OBJECTS().TopDiff( TYPES.ARRAY, _getArraysDiff( leftJson, rightJson ) );
  else if ( leftJsonType === TYPES.OBJECT && rightJsonType === TYPES.OBJECT ) return new OBJECTS().TopDiff( TYPES.OBJECT, _getJsonsDiff( leftJson, rightJson ) );
  else {
    strategy = new ComparingKeyAndValueStrategy();
    var leftOutput = new OBJECTS().Diff( null, _getInDepthDiff( leftJson, OPS.ADD ), OPS.ADD, leftJsonType );
    var rightOutput = new OBJECTS().Diff( null, _getInDepthDiff( rightJson, OPS.REMOVE ), OPS.REMOVE, rightJsonType );
    return new OBJECTS().TopDiff( TYPES.NULL, [leftOutput, rightOutput] );
  }
}



exports.ComparingKeyAndValueStrategy = ComparingKeyAndValueStrategy;
exports.ComparingKeyStrategy = ComparingKeyStrategy;
exports.getDiffRepresentation = getDiffRepresentation;