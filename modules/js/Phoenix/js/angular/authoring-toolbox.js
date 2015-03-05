'use-strict';
(function($p) {
    var app = angular.module("phoenix.ui");
    app.controller('uiToolboxController', ["$scope", function($scope) {
    }]);    

    app.directive('authoringToolbox', [function() {
        return {
            scope: {
                config:'='
            },
            bindToController: true,
            restrict: 'E',
            replace: true,
            controller: 'uiToolboxController',
            controllerAs: 'item',
            link: function(scope, element, attrs) {
                if (!$p.ui.ToolBox) return;
                scope.component = new $p.ui.ToolBox(scope.item.config, {
                    design: true,
                    replaceParent: true,
                    context: "angular"
                });
                scope.component.render(element)
                scope.$on("$destroy", function() {
                    if (scope.component) scope.component.destroy()
                });
            }
        };
    }]);
})(Phoenix);