'use strict';
(function($p) {
    var api = '/api'

    function DataFactory() {
        var factory = {
            get: function(url) {
                return $p.ajax.get(api + url);
            },
            put: function(url, data) {
                return $p.ajax.put(api + url, data);
            }
        };
        return factory;

    }
    angular.module("phoenix.data", []).factory('restapi', [DataFactory]);

})(Phoenix);
