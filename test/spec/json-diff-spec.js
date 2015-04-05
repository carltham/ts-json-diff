describe("Json diff", function() {

  it("Two empty arrays should be equal", function() {
    expect(areJsonsEqual("[]", "[]")).toBe(true);
  });

  it("Two empty JSON objects should be equal", function() {
    expect(areJsonsEqual("{}", "{}")).toBe(true);
  });

  it("Array and Json objest should not be equal", function() {
    expect(areJsonsEqual("[]", "{}")).toBe(false);
  });
  
  it("Two arrays with the same elements but in different order should not be equal ", function() {
    expect(areJsonsEqual("[1,2,3]", "[1,3,2]")).toBe(false);
  });
  
  it("Two arrays with the same elements in the same order should be equal", function() {
    expect(areJsonsEqual("[3,1,2]", "[3,1,2]")).toBe(true);
  });

  it("Two the same flat JSON objects should be equal", function() {
    expect(areJsonsEqual("{\"key1\": 12, \"key2\":\"some value\"}", "{\"key2\":\"some value\", \"key1\": 12}")).toBe(true);
  });

  it("Two flat JSON objects with different key should not be equal", function() {
    expect(areJsonsEqual("{\"key1\": 12}", "{\"key2\": 12}")).toBe(false);
  });

  it("Two flat JSON objects with different value should not be equal", function() {
    expect(areJsonsEqual("{\"key1\": 1234}", "{\"key1\": 12}")).toBe(false);
  });
});

describe("Get Json diff representation", function() {

  it("For two arrays with different value should return correct diff", function() {
    var result = getDiffRepresentation("[1,2]", "[4,5]");
    expect(result[0].value).toEqual(1);
    expect(result[0].diffType).toEqual("REPLACE");
    expect(result[0].oldValue).toEqual(4);
    expect(result[1].value).toEqual(2);
    expect(result[1].diffType).toEqual("REPLACE");
    expect(result[1].oldValue).toEqual(5);
  });

  it("For two arrays with the same values should return correct diff", function() {
    var result = getDiffRepresentation("[1,2]", "[1,2]");
    expect(result[0].value).toEqual(1);
    expect(result[0].diffType).toEqual("NONE");
    expect(result[1].value).toEqual(2);
    expect(result[1].diffType).toEqual("NONE");
  });

  it("For two the same flat JSONs should return object without any differences", function() {
    var result = getDiffRepresentation("{\"key1\": 123, \"key2\": \"some value\"}", "{\"key2\": \"some value\", \"key1\": 123}");
    expect(result["key1"].value).toEqual(123);
    expect(result["key1"].diffType).toEqual("NONE");
    expect(result["key2"].value).toEqual("some value");
    expect(result["key2"].diffType).toEqual("NONE");
  });
  
  it("For two arrays with flat JSONs on it should return correct diff", function() {
    var result = getDiffRepresentation("[1,2,{\"key1\": 234, \"key2\": \"val\"}]",
				       "[3,2,{\"key2\": 234, \"key3\": \"val\"}]");
    expect(result[0].value).toEqual(1);
    expect(result[0].diffType).toEqual("REPLACE");
    expect(result[0].oldValue).toEqual(3);
    expect(result[1].value).toEqual(2);
    expect(result[1].diffType).toEqual("NONE");
    expect(result[2]["key1"].value).toEqual(234);
    expect(result[2]["key1"].diffType).toEqual("ADD");
    expect(result[2]["key2"].value).toEqual("val");
    expect(result[2]["key2"].diffType).toEqual("REPLACE");
    expect(result[2]["key2"].oldValue).toEqual(234);
    expect(result[2]["key3"].value).toEqual("val");
    expect(result[2]["key3"].diffType).toEqual("REMOVE");
  });
});
