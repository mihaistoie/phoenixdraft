'use strict';
(function () {
    function _controller($scope, $rootScope, restapi, authoring, model, toolbox) {
        $scope.model = model;
        $scope.toolbox = toolbox;
        $scope.save = function(data) {
        	restapi.put('/layout/'+data.name, data);
        }
    }
    var app = angular.module('phoenix.authoring', ['phoenix.data']);
    app.controller('AuthoringCtrl', ['$scope', "$rootScope", "restapi", 'authoring', 'model', 'toolbox', _controller]);
})();
