'use-strict';
(function($p) {
    var app = angular.module("phoenix.ui");
    app.directive('propertyEditor', [function() {
        return {
            scope: {
                authoring: '='
            },
            restrict: 'E',
            replace: true,
            link: function(scope, element, attrs) {
                if (!$p.ui.PropertyEditor) return;
                scope.component = new $p.ui.PropertyEditor({
                    design: scope.item.authoring,
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
