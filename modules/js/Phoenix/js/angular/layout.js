'use-strict';
(function($p) {
    var app = angular.module("phoenix.ui");
    app.controller('uiLayoutController', ["$scope", function($scope) {
    }]);
    app.directive('layout', ['$compile', function($compile) {
        return {
            scope: {
                model: '=',
                authoring: '=',
                save: '&'
            },
            bindToController: true,
            restrict: 'E',
            replace: true,
            controller: 'uiLayoutController',
            controllerAs: 'layout',
            link: function(scope, element, attrs) {
                var model = scope.layout.model || {};
                scope.component = new $p.ui.Layout(model, {
                    design: scope.layout.authoring,
                    replaceParent: true,
                    context: "angular",
                    beforeAdd: function(el) {
                        $compile(el)(scope);
                    }
                });
                scope.component.saveHandler = function(cd) {
                    scope.layout.save({model: cd});
                };
                scope.component.render(element);
                scope.$on("$destroy", function() {
                    scope.component.destroy()
                });
            }
        }
    }]);
})(Phoenix);
