'use-strict';
(function($p) {
    var app = angular.module("phoenix.ui");
    app.controller('uiWidgetTestController', ["$scope", function($scope) {
    }]);
    app.directive('widgetTest', [function() {
        return {
            scope: {
                data: '=',
                authoring: '='
            },
            restrict: 'E',
            replace: true,
            controller: 'uiWidgetTestController',
            template: '<center>Angular JS Widget </center>'
        }
    }]);
})(Phoenix);
