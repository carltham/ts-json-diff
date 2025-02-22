const { ValidationException, TYPES, OPS, OTHER } = require( "./domain" );
const { ComparingKeyStrategy, getDiffRepresentation } = require( "./json-diff" );


describe( "Get Json diff representation when comparing by keys", function () {
  var strategy = new ComparingKeyStrategy();

  it( "For two arrays with different value should return correct diff", function () {
    var result = getDiffRepresentation( "[1,2]", "[4,5]", strategy );
    expect( result.topType ).toEqual( TYPES.ARRAY );
    expect( result.diff.length ).toEqual( 2 );
    expect( result.diff[0].value ).toEqual( OTHER.NON_RELEVANT_VALUE );
    expect( result.diff[0].op ).toEqual( OPS.NONE );
    expect( result.diff[0].valueType ).toEqual( TYPES.SCALAR );
    expect( result.diff[1].value ).toEqual( OTHER.NON_RELEVANT_VALUE );
    expect( result.diff[1].op ).toEqual( OPS.NONE );
    expect( result.diff[1].valueType ).toEqual( TYPES.SCALAR );
  } );

  it( "For two arrays with the same values should return correct diff", function () {
    var result = getDiffRepresentation( "[1,2]", "[1,2]", strategy );
    expect( result.topType ).toEqual( TYPES.ARRAY );
    expect( result.diff.length ).toEqual( 2 );
    expect( result.diff[0].value ).toEqual( OTHER.NON_RELEVANT_VALUE );
    expect( result.diff[0].op ).toEqual( OPS.NONE );
    expect( result.diff[0].valueType ).toEqual( TYPES.SCALAR );
    expect( result.diff[1].value ).toEqual( OTHER.NON_RELEVANT_VALUE );
    expect( result.diff[1].op ).toEqual( OPS.NONE );
    expect( result.diff[1].valueType ).toEqual( TYPES.SCALAR );
  } );

  it( "For two the same flat JSONs should return object without any differences", function () {
    var result = getDiffRepresentation(
      '{"key1": 123, "key2": "some value"}',
      '{"key2": "some value", "key1": 123}',
      strategy
    );
    expect( result.topType ).toEqual( TYPES.OBJECT );
    expect( result.diff[0].key ).toEqual( "key1" );
    expect( result.diff[0].value ).toEqual( OTHER.NON_RELEVANT_VALUE );
    expect( result.diff[0].op ).toEqual( OPS.NONE );
    expect( result.diff[0].valueType ).toEqual( TYPES.SCALAR );
    expect( result.diff[1].key ).toEqual( "key2" );
    expect( result.diff[1].value ).toEqual( OTHER.NON_RELEVANT_VALUE );
    expect( result.diff[1].op ).toEqual( OPS.NONE );
    expect( result.diff[1].valueType ).toEqual( TYPES.SCALAR );
  } );

  it( "For two arrays with flat JSONs on it should return correct diff", function () {
    var result = getDiffRepresentation(
      '[1,2,{"key1": 234, "key2": "val"}]',
      '[3,2,{"key2": 234, "key3": "val"}]',
      strategy
    );
    expect( result.topType ).toEqual( TYPES.ARRAY );
    expect( result.diff[0].value ).toEqual( OTHER.NON_RELEVANT_VALUE );
    expect( result.diff[0].op ).toEqual( OPS.NONE );
    expect( result.diff[0].valueType ).toEqual( TYPES.SCALAR );
    expect( result.diff[1].value ).toEqual( OTHER.NON_RELEVANT_VALUE );
    expect( result.diff[1].op ).toEqual( OPS.NONE );
    expect( result.diff[1].valueType ).toEqual( TYPES.SCALAR );

    expect( result.diff[2].op ).toEqual( OPS.NONE );
    expect( result.diff[2].valueType ).toEqual( TYPES.OBJECT );
    expect( result.diff[2].value[0].key ).toEqual( "key1" );
    expect( result.diff[2].value[0].value ).toEqual( OTHER.NON_RELEVANT_VALUE );
    expect( result.diff[2].value[0].op ).toEqual( OPS.ADD );
    expect( result.diff[2].value[0].valueType ).toEqual( TYPES.SCALAR );
    expect( result.diff[2].value[1].key ).toEqual( "key2" );
    expect( result.diff[2].value[1].value ).toEqual( OTHER.NON_RELEVANT_VALUE );
    expect( result.diff[2].value[1].op ).toEqual( OPS.NONE );
    expect( result.diff[2].value[1].valueType ).toEqual( TYPES.SCALAR );
    expect( result.diff[2].value[2].key ).toEqual( "key3" );
    expect( result.diff[2].value[2].value ).toEqual( OTHER.NON_RELEVANT_VALUE );
    expect( result.diff[2].value[2].op ).toEqual( OPS.REMOVE );
    expect( result.diff[2].value[2].valueType ).toEqual( TYPES.SCALAR );
  } );

  it( "Array of arrays and empty flat array should be the same", function () {
    var result = getDiffRepresentation( "[]", "[[],[]]", strategy );
    expect( result.topType ).toEqual( TYPES.ARRAY );
    expect( result.diff[0].value ).toEqual( OTHER.NON_RELEVANT_VALUE );
    expect( result.diff[0].op ).toEqual( OPS.NONE );
    expect( result.diff[0].valueType ).toEqual( TYPES.SCALAR );
    expect( result.diff[1].value ).toEqual( OTHER.NON_RELEVANT_VALUE );
    expect( result.diff[1].op ).toEqual( OPS.NONE );
    expect( result.diff[1].valueType ).toEqual( TYPES.SCALAR );
  } );

  it( "Two similar with small difference in value hidden in depth should be the same", function () {
    var result = getDiffRepresentation(
      '{"a":{"b":{"c":"d"}}}',
      '{"a":{"b":{"c":"e"}}}',
      strategy
    );

    expect( result.topType ).toEqual( TYPES.OBJECT );
    expect( result.diff[0].key ).toEqual( "a" );
    expect( result.diff[0].op ).toEqual( OPS.NONE );
    expect( result.diff[0].valueType ).toEqual( TYPES.OBJECT );
    expect( result.diff[0].value[0].key ).toEqual( "b" );
    expect( result.diff[0].value[0].op ).toEqual( OPS.NONE );
    expect( result.diff[0].value[0].valueType ).toEqual( TYPES.OBJECT );
    expect( result.diff[0].value[0].value[0].key ).toEqual( "c" );
    expect( result.diff[0].value[0].value[0].op ).toEqual( OPS.NONE );
    expect( result.diff[0].value[0].value[0].valueType ).toEqual( TYPES.SCALAR );
    expect( result.diff[0].value[0].value[0].value ).toEqual( OTHER.NON_RELEVANT_VALUE );
  } );

  it( "Should return always well structured output", function () {
    var result = getDiffRepresentation(
      '{"a":[1, 2, 3]}',
      '{"b":{"c":12,"d":[1, 2]}}',
      strategy
    );

    expect( result.topType ).toEqual( TYPES.OBJECT );
    expect( result.diff[0].key ).toEqual( "a" );
    expect( result.diff[0].op ).toEqual( OPS.ADD );
    expect( result.diff[0].valueType ).toEqual( TYPES.SCALAR );
    expect( result.diff[0].value ).toEqual( OTHER.NON_RELEVANT_VALUE );

    expect( result.diff[1].key ).toEqual( "b" );
    expect( result.diff[1].op ).toEqual( OPS.REMOVE );
    expect( result.diff[1].valueType ).toEqual( TYPES.SCALAR );
    expect( result.diff[1].value ).toEqual( OTHER.NON_RELEVANT_VALUE );
  } );

  it( "Array and JSON object have nothing in common so returned diff should represent that", function () {
    var result = getDiffRepresentation( "[1,2]", '{"a": "hello"}', strategy );
    expect( result.topType ).toEqual( TYPES.NULL );
    expect( result.diff[0].op ).toEqual( OPS.ADD );
    expect( result.diff[0].valueType ).toEqual( TYPES.ARRAY );
    expect( result.diff[0].value[0].op ).toEqual( OPS.ADD );
    expect( result.diff[0].value[0].valueType ).toEqual( TYPES.SCALAR );
    expect( result.diff[0].value[0].value ).toEqual( 1 );
    expect( result.diff[0].value[1].op ).toEqual( OPS.ADD );
    expect( result.diff[0].value[1].valueType ).toEqual( TYPES.SCALAR );
    expect( result.diff[0].value[1].value ).toEqual( 2 );
    expect( result.diff[1].op ).toEqual( OPS.REMOVE );
    expect( result.diff[1].valueType ).toEqual( TYPES.OBJECT );
    expect( result.diff[1].value[0].op ).toEqual( OPS.REMOVE );
    expect( result.diff[1].value[0].valueType ).toEqual( TYPES.SCALAR );
    expect( result.diff[1].value[0].key ).toEqual( "a" );
    expect( result.diff[1].value[0].value ).toEqual( "hello" );
  } );

  it( "Two jsons with the same single key but different structure under it should be the same", function () {
    var result = getDiffRepresentation( '{"a":[]}', '{"a":{}}', strategy );
    expect( result.topType ).toEqual( TYPES.OBJECT );
    expect( result.diff[0].op ).toEqual( OPS.NONE );
    expect( result.diff[0].valueType ).toEqual( TYPES.SCALAR );
    expect( result.diff[0].value ).toEqual( "..." );
  } );
} );

describe( "Json diff exception handling", function () {
  it( "Diff should throw exception with correct error message when left json is invalid", function () {
    var call = function () {
      getDiffRepresentation( "Oh, how I wish you were here now...", '{"a":"1"}' );
    };
    expect( call ).toThrow(
      ValidationException( "Input is not a valid JSON", null )
    );
  } );

  it( "Diff should throw exception with correct error message when right json is invalid", function () {
    var call = function () {
      getDiffRepresentation( '{"a":"1"}', "... we were just two lost souls" );
    };
    expect( call ).toThrow(
      ValidationException( null, "Input is not a valid JSON" )
    );
  } );

  it( "Diff should throw exception with correct error message when left and right json is invalid", function () {
    var call = function () {
      getDiffRepresentation(
        "... swimming in a fish bowl...",
        "... year after year."
      );
    };
    expect( call ).toThrow(
      ValidationException(
        "Input is not a valid JSON",
        "Input is not a valid JSON"
      )
    );
  } );

  it( "Diff should throw exception with correct error message when one of jsons is scalar", function () {
    var call = function () {
      getDiffRepresentation( "11", "{}" );
    };
    expect( call ).toThrow(
      ValidationException( "Input is not a valid JSON", null )
    );
  } );

  it( "Diff should throw exception with correct error message when one of jsons is null", function () {
    var call = function () {
      getDiffRepresentation( "{}", "null" );
    };
    expect( call ).toThrow(
      ValidationException( null, "Input is not a valid JSON" )
    );
  } );
} );
