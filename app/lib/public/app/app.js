'use strict';

(function($p) {
	var _layoutResolver = ['$route', 'restapi', function($route, restapi) {
		return restapi.get('/layout/' + ($route.current.params.layoutId || "home"));
	}];
	var _toolBoxResolver = ['$route', 'restapi', function($route, restapi) {
		return restapi.get('/toolbox/default');
	}];

	var _authoringResolver = ['$route', function($route) {
		return $p.ajax.getScript('./phoenix/js/phoenix.design.js');
	}];


	// Declare app level module which depends on views, and components
	angular.module('app', [
		'ngRoute', 'phoenix.page', 'phoenix.authoring', 'phoenix.ui', 'phoenix.data'
	]).
	config(['$routeProvider', function($routeProvider) {
		$routeProvider.
		when('/authoring/:layoutId', {
			templateUrl: './authoring/authoring.html',
			controller: 'AuthoringCtrl',
			resolve: {
				authoring: _authoringResolver,
				model: _layoutResolver,
				toolbox: _toolBoxResolver
			}
		}).
		when('/:layoutId', {
			template: '<layout model="model"></layout>',
			controller: 'PageCtrl',
			resolve: {
				model: _layoutResolver
			}
		}).
		otherwise({
			redirectTo: '/home'
		});
	}]);

})(Phoenix);
