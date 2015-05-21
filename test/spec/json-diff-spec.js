describe("Get Json diff representation", function() {

  it("For two arrays with different value should return correct diff", function() {
    var result = getDiffRepresentation("[1,2]", "[4,5]");
    expect(result.type).toEqual(ARRAY);
    expect(result.diff[0].value).toEqual(1);
    expect(result.diff[0].op).toEqual(ADD);
    expect(result.diff[0].valueType).toEqual(SCALAR);
    expect(result.diff[1].value).toEqual(4);
    expect(result.diff[1].op).toEqual(REMOVE);
    expect(result.diff[1].valueType).toEqual(SCALAR);
    expect(result.diff[2].value).toEqual(2);
    expect(result.diff[2].op).toEqual(ADD);
    expect(result.diff[2].valueType).toEqual(SCALAR);
    expect(result.diff[3].value).toEqual(5);
    expect(result.diff[3].op).toEqual(REMOVE);
    expect(result.diff[3].valueType).toEqual(SCALAR);
  });

  it("For two arrays with the same values should return correct diff", function() {
    var result = getDiffRepresentation("[1,2]", "[1,2]");
    expect(result.type).toEqual(ARRAY);
    expect(result.diff[0].value).toEqual(1);
    expect(result.diff[0].op).toEqual(NONE);
    expect(result.diff[0].valueType).toEqual(SCALAR);
    expect(result.diff[1].value).toEqual(2);
    expect(result.diff[1].op).toEqual(NONE);
    expect(result.diff[1].valueType).toEqual(SCALAR);
  });

  it("For two the same flat JSONs should return object without any differences", function() {
    var result = getDiffRepresentation("{\"key1\": 123, \"key2\": \"some value\"}", "{\"key2\": \"some value\", \"key1\": 123}");
    expect(result.type).toEqual(OBJECT);
    expect(result.diff[0].key).toEqual("key1");
    expect(result.diff[0].value).toEqual(123);
    expect(result.diff[0].op).toEqual(NONE);
    expect(result.diff[0].valueType).toEqual(SCALAR);
    expect(result.diff[1].key).toEqual("key2");
    expect(result.diff[1].value).toEqual("some value");
    expect(result.diff[1].op).toEqual(NONE);
    expect(result.diff[1].valueType).toEqual(SCALAR);
  });

  it("For two arrays with flat JSONs on it should return correct diff", function() {
    var result = getDiffRepresentation("[1,2,{\"key1\": 234, \"key2\": \"val\"}]",
                                       "[3,2,{\"key2\": 234, \"key3\": \"val\"}]");
    expect(result.type).toEqual(ARRAY);
    expect(result.diff[0].value).toEqual(1);
    expect(result.diff[0].op).toEqual(ADD);
    expect(result.diff[0].valueType).toEqual(SCALAR);
    expect(result.diff[1].value).toEqual(3);
    expect(result.diff[1].op).toEqual(REMOVE);
    expect(result.diff[1].valueType).toEqual(SCALAR);
    expect(result.diff[2].value).toEqual(2);
    expect(result.diff[2].op).toEqual(NONE);
    expect(result.diff[2].valueType).toEqual(SCALAR);
    expect(result.diff[3].op).toEqual(NONE);
    expect(result.diff[3].valueType).toEqual(OBJECT);

    expect(result.diff[3].value[0].key).toEqual("key1");
    expect(result.diff[3].value[0].value).toEqual(234);
    expect(result.diff[3].value[0].op).toEqual(ADD);
    expect(result.diff[3].value[0].valueType).toEqual(SCALAR);
    expect(result.diff[3].value[1].key).toEqual("key2");
    expect(result.diff[3].value[1].value).toEqual("val");
    expect(result.diff[3].value[1].op).toEqual(ADD);
    expect(result.diff[3].value[1].valueType).toEqual(SCALAR);
    expect(result.diff[3].value[2].key).toEqual("key2");
    expect(result.diff[3].value[2].value).toEqual(234);
    expect(result.diff[3].value[2].op).toEqual(REMOVE);
    expect(result.diff[3].value[2].valueType).toEqual(SCALAR);
    expect(result.diff[3].value[3].key).toEqual("key3");
    expect(result.diff[3].value[3].value).toEqual("val");
    expect(result.diff[3].value[3].op).toEqual(REMOVE);
    expect(result.diff[3].value[3].valueType).toEqual(SCALAR);
  });

  it("Array of arrays and empty flat array should be different", function() {
    var result = getDiffRepresentation("[]", "[[],[]]");
    expect(result.type).toEqual(ARRAY);
    expect(result.diff[0].value).toEqual([]);
    expect(result.diff[0].op).toEqual(REMOVE);
    expect(result.diff[0].valueType).toEqual(ARRAY);
    expect(result.diff[1].value).toEqual([]);
    expect(result.diff[1].op).toEqual(REMOVE);
    expect(result.diff[1].valueType).toEqual(ARRAY);
  });

  it("Array and JSON object have nothing in common so should throw exception", function() {
    var call = function() {
      return getDiffRepresentation("[]", "{}");
    };
    expect(call).toThrow();
  });

  it("Two similar with small difference hidden in depth should be different", function() {
    var result = getDiffRepresentation("{\"a\":{\"b\":{\"c\":\"d\"}}}", "{\"a\":{\"b\":{\"c\":\"e\"}}}");

    expect(result.type).toEqual(OBJECT);
    expect(result.diff[0].key).toEqual("a");
    expect(result.diff[0].op).toEqual(NONE);
    expect(result.diff[0].valueType).toEqual(OBJECT);
    expect(result.diff[0].value[0].key).toEqual("b");
    expect(result.diff[0].value[0].op).toEqual(NONE);
    expect(result.diff[0].value[0].valueType).toEqual(OBJECT);
    expect(result.diff[0].value[0].value[0].key).toEqual("c");
    expect(result.diff[0].value[0].value[0].op).toEqual(ADD);
    expect(result.diff[0].value[0].value[0].valueType).toEqual(SCALAR);
    expect(result.diff[0].value[0].value[0].value).toEqual("d");
    expect(result.diff[0].value[0].value[1].key).toEqual("c");
    expect(result.diff[0].value[0].value[1].op).toEqual(REMOVE);
    expect(result.diff[0].value[0].value[1].valueType).toEqual(SCALAR);
    expect(result.diff[0].value[0].value[1].value).toEqual("e");
  });

  it("Should return always well structured output", function() {
    var result = getDiffRepresentation("{\"a\":[1, 2, 3]}",
        "{\"b\":{\"c\":12,\"d\":[1, 2]}}");

    expect(result.type).toEqual(OBJECT);
    expect(result.diff[0].key).toEqual("a");
    expect(result.diff[0].op).toEqual(ADD);
    expect(result.diff[0].valueType).toEqual(ARRAY);
    expect(result.diff[0].value[0].op).toEqual(ADD);
    expect(result.diff[0].value[0].valueType).toEqual(SCALAR);
    expect(result.diff[0].value[0].value).toEqual(1);
    expect(result.diff[0].value[1].op).toEqual(ADD);
    expect(result.diff[0].value[1].valueType).toEqual(SCALAR);
    expect(result.diff[0].value[1].value).toEqual(2);
    expect(result.diff[0].value[2].op).toEqual(ADD);
    expect(result.diff[0].value[2].valueType).toEqual(SCALAR);
    expect(result.diff[0].value[2].value).toEqual(3);

    expect(result.diff[1].key).toEqual("b");
    expect(result.diff[1].op).toEqual(REMOVE);
    expect(result.diff[1].valueType).toEqual(OBJECT);
    expect(result.diff[1].value[0].op).toEqual(REMOVE);
    expect(result.diff[1].value[0].valueType).toEqual(SCALAR);
    expect(result.diff[1].value[0].value).toEqual(12);
    expect(result.diff[1].value[0].key).toEqual("c");
    expect(result.diff[1].value[1].op).toEqual(REMOVE);
    expect(result.diff[1].value[1].valueType).toEqual(ARRAY);
    expect(result.diff[1].value[1].key).toEqual("d");
    expect(result.diff[1].value[1].value[0].op).toEqual(REMOVE);
    expect(result.diff[1].value[1].value[0].valueType).toEqual(SCALAR);
    expect(result.diff[1].value[1].value[0].value).toEqual(1);
    expect(result.diff[1].value[1].value[1].op).toEqual(REMOVE);
    expect(result.diff[1].value[1].value[1].valueType).toEqual(SCALAR);
    expect(result.diff[1].value[1].value[1].value).toEqual(2);
  });

  it("Diff from non-existing key in one of jsons should be sorted", function() {
    var result = getDiffRepresentation("{\"a\":{\"e\":12,\"b\":32,\"d\":11}}",
        "{}");

    expect(result.type).toEqual(OBJECT);
    expect(result.diff[0].key).toEqual("a");
    expect(result.diff[0].op).toEqual(ADD);
    expect(result.diff[0].valueType).toEqual(OBJECT);
    expect(result.diff[0].value[0].op).toEqual(ADD);
    expect(result.diff[0].value[0].valueType).toEqual(SCALAR);
    expect(result.diff[0].value[0].value).toEqual(32);
    expect(result.diff[0].value[0].key).toEqual("b");
    expect(result.diff[0].value[1].op).toEqual(ADD);
    expect(result.diff[0].value[1].valueType).toEqual(SCALAR);
    expect(result.diff[0].value[1].value).toEqual(11);
    expect(result.diff[0].value[1].key).toEqual("d");
    expect(result.diff[0].value[2].op).toEqual(ADD);
    expect(result.diff[0].value[2].valueType).toEqual(SCALAR);
    expect(result.diff[0].value[2].value).toEqual(12);
    expect(result.diff[0].value[2].key).toEqual("e");
  });

  it("Diff should be sorted by key and operation", function() {
      var result = getDiffRepresentation("{\"a\":1}", "{\"a\":\"1\"}");

      expect(result.type).toEqual(OBJECT);
      expect(result.diff[0].key).toEqual("a");
      expect(result.diff[0].op).toEqual(ADD);
      expect(result.diff[0].valueType).toEqual(SCALAR);
      expect(result.diff[1].key).toEqual("a");
      expect(result.diff[1].op).toEqual(REMOVE);
      expect(result.diff[1].valueType).toEqual(SCALAR);
  })
});
