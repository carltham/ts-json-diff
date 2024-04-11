import { ValidationException } from "./domain";
import { getDiffRepresentation } from "./json-diff";

describe("Json diff exception handling", function () {
  it("Diff should throw exception with correct error message when left json is invalid", function () {
    var call = function () {
      getDiffRepresentation(
        "Oh, how I wish you were here now...",
        '{"a":"1"}',
        null
      );
    };
    expect(call).toThrow(
      new ValidationException("Input is not a valid JSON", null)
    );
  });

  it("Diff should throw exception with correct error message when right json is invalid", function () {
    var call = function () {
      getDiffRepresentation(
        '{"a":"1"}',
        "... we were just two lost souls",
        null
      );
    };
    expect(call).toThrow(
      new ValidationException(null, "Input is not a valid JSON")
    );
  });

  it("Diff should throw exception with correct error message when left and right json is invalid", function () {
    var call = function () {
      getDiffRepresentation(
        "... swimming in a fish bowl...",
        "... year after year.",
        null
      );
    };
    expect(call).toThrow(
      new ValidationException(
        "Input is not a valid JSON",
        "Input is not a valid JSON"
      )
    );
  });

  it("Diff should throw exception with correct error message when one of jsons is scalar", function () {
    var call = function () {
      getDiffRepresentation("11", "{}", null);
    };
    expect(call).toThrow(
      new ValidationException("Input is not a valid JSON", null)
    );
  });

  it("Diff should throw exception with correct error message when one of jsons is null", function () {
    var call = function () {
      getDiffRepresentation("{}", "null", null);
    };
    expect(call).toThrow(
      new ValidationException(null, "Input is not a valid JSON")
    );
  });
});
