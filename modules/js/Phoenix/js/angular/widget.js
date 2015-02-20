'use-strict';
(function($p) {
    var app = angular.module("phoenix.ui");
    app.controller('uiWidgetController', ["$scope", function($scope) {
        
    }]);
    app.directive('widget', ['$compile', function($compile) {
        return {
            scope: {
                data: '=',
                authoring: '='
            },
            bindToController: true,
            restrict: 'E',
            replace: true,
            controller: 'uiWidgetController',
            controllerAs: 'item',
            link: function(scope, element, attrs) {
                var model = scope.item.data || {};
                scope.component = new $p.ui.Widget(model, {
                    design: scope.item.authoring,
                    replaceParent: true,
                    context: "angular",
                    beforeAdd: function(el) {
                        $compile(el)(scope);
                    }
                });
                scope.component.render(element)
                scope.$on("$destroy", function() {
                    scope.component.destroy()
                });
            }
        }
    }]);
    var _renderWiget = function(html, data, parent, model, options) {
        html.push('<widget authoring="' + (options.design ? "true" : "false") + '" data=layout.model.fields.' +data.$id + '></widget>');
    };
    var _renderWigetContent = function(html, data, options) {
        html.push('<widget-'+ data.$type +' authoring="' + (options.design ? "true" : "false") + '" data=component.props></'+data.$type  + '-widget>');
    };
    $p.render.register("angular", "widget.content", _renderWigetContent);
    $p.render.register("angular", "widget", _renderWiget);
})(Phoenix);
