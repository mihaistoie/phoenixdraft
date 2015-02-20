'use strict';

(function($p) {
	var _layoutResolver = ['$route', function($route) { 
		return $p.ajax.get('/api/layout/' + $route.current.params.layoutId);
	}];
	
	// Declare app level module which depends on views, and components
	angular.module('app', [
	  'ngRoute', 'phoenix.page', 'phoenix.ui'
	]).
	config(['$routeProvider', function($routeProvider) {
	  $routeProvider.
		  when('/:layoutId', {
			template: '<layout model="model" authoring="false" preview="true"></layout>',
			controller: 'PageCtrl',
			resolve: {
				model: _layoutResolver
			}		
		  }).
		  otherwise({
			redirectTo: '/'
		  });
	}]);
})(Phoenix);