'use-strict';
(function($p) {
	var app = angular.module("phoenix.ui", []);
})(Phoenix);

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

'use-strict';
(function($p) {
    var app = angular.module("phoenix.ui");
    app.directive('propertyEditor', [function() {
        return {
            scope: {},
            restrict: 'E',
            replace: true,
            link: function(scope, element, attrs) {
                if (!$p.ui.PropertyEditor) return;
                scope.component = new $p.ui.PropertyEditor({
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