'use-strict';
(function($p) {
    var app = angular.module("phoenix.ui");
    app.controller('uiWidgetTestController', ["$scope", function($scope) {
        console.log("widget-test");    
        console.log($scope.data);
        $scope.data.$title = " AAAAA ";
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
            template: '<div>Angular JS Widget </div>'
        }
    }]);
})(Phoenix);
