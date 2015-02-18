'use strict';
(function () {
    function _controller($scope, $rootScope, model) {
        $scope.model = model || null;
    }
    var app = angular.module('phoenix.page', []);
    app.controller('PageCtrl', ['$scope', "$rootScope", 'model', _controller]);
})();

