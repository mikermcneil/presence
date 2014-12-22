angular.module('evaluateAngularExpr', []);

angular.module('evaluateAngularExpr')
.factory('evaluateAngularExpr', [

/**
 * Module Dependencies
 */

  '$timeout',
  '$parse',
function(
  $timeout,
  $parse
) {


  /**
   * evaluateAngularExpr
   *
   * @class        {angular.factory}
   * @module       evaluateAngularExpression
   * @type         {Function}
   * @description  Given an angular expression string, evaluate it within `env.$scope`.
   *
   * Inputs
   * * * * * * * * * * * * * * * * * * * * * *
   * @required {String} expression
   * @optional {Object} locals
   */

  return function evaluateAngularExpr(inputs, exits, env) {
    $timeout(function (){
      var expressionFn = $parse(inputs.expression);
      env.$scope.$apply(function() {
        var result = expressionFn(env.$scope, inputs.locals||{});
        if (exits && exits.success) {
          return exits.success(result);
        }
      });
    });
  };

}]);

