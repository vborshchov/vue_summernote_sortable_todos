beforeEach(function () {
  jasmine.addMatchers({
    toBeArray: function () {
      return {
        compare: function (actual, expected) {
          var obj = actual;

          return {
            pass: !!obj && Array === obj.constructor
          };
        }
      };
    }
  });
});
