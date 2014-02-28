'use strict';

angular.module('angularApp')
  .controller('MainCtrl', function ($scope, apiutils) {
    apiutils.get('/players/').then(function(response) {
      $scope.players = response.data;
    })
    
    $scope.postester = function() {
      console.log('clicked')
      apiutils.get('players/?position=wr').then(function(response) {
        console.log('clicked')
        $scope.players = response.data;
      })
    }
  })
  .controller('gridCtrl', function ($scope, apiutils) {
    $scope.get_single_player = function(player_id) {
      $scope.active_player = player_id
      apiutils.get('players/'+player_id).then(function(response){
        $scope.active_player_data = response.data
        console.log($scope.active_player_data)
        }
      );
      }
    var i = true
      $scope.order_weeks = function(game) {
          var week = parseInt(game.game.week)
          if (game.game.season_type == 'Preseason'){
            week = week - 5
            }
          if (game.game.season_type == 'Postseason'){
            week = week + 20
          }
          return week
      }

    }    
  )
  .controller('TeamCtrl', function($scope, apiutils) {
    apiutils.get('teams/').then(function(response) {
      $scope.teams = response.data;
    })
  })
  .controller('SingleTeamCtrl', function($scope, apiutils, $routeParams) {
      var get_data = function() {
        apiutils.get('/teams/'+$routeParams.id).then(function(response) {
          $scope.players = response.data
          console.log($scope.players)
          makeWrs()
        })
      }
    get_data()
    
    $scope.tester = [$scope.players]
    
    setTimeout(function(){
      $scope.tester = 10
    }, 1000);
   
    function makeWrs() {    
      $scope.wrs = []
      var sum_yds = 0
        for (var index in $scope.players) {
        if ($scope.players[index].stats.receiving_rec > 1) {
          $scope.wrs.push($scope.players[index]);
          sum_yds += $scope.players[index].stats.receiving_yds
        } //end if
      } // end for
    }//end makeWrs()
      
    })
  
