'use strict';

angular.module('angularApp', ['ui.bootstrap'])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'app/views/main.html',
        controller: 'MainCtrl'
      })
      .when('/teams', {
        templateUrl: 'app/views/teams.html',
        controller: 'TeamCtrl'
      })
      .when('/teams/:id', {
        templateUrl: 'app/views/single_team.html',
        controller: 'SingleTeamCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
