'use-strict';
(function($p) {
    var app = angular.module("phoenix.ui");
    app.directive('authoringToolbar', [function() {
        return {
            scope: {},
            restrict: 'E',
            replace: true,
            link: function(scope, element, attrs) {
                if (!$p.ui.AuthoringToolBar) return;
                scope.component = new $p.ui.AuthoringToolBar({
                    design: true,
                    replaceParent: true,
                    context: "angular"
                });
                scope.component.render(element)
                scope.$on("$destroy", function() {
                    if (scope.component) scope.component.destroy()
                });
            }
        }
    }]);
})(Phoenix);