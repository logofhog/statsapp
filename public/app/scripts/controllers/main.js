'use strict';

angular.module('angularApp')
  .controller('MainCtrl', function ($scope, apiutils) {
    
    apiutils.get('/players/').then(function(response) {
      $scope.players = response.data;
    })
    
    $scope.get_position = function(position) {
      apiutils.get('players/?position='+position).then(function(response) {
        $scope.players = response.data;
      })
    }
  })
  .controller('gridCtrl', function ($scope, apiutils) {
    $scope.get_single_player = function(player_id) {
      $scope.active_player = player_id
      apiutils.get('players/'+player_id).then(function(response){
        $scope.active_player_data = response.data
        }
      );
      }

    $scope.statChoice = function(stat) {
      makeGraphData(stat)
    }
     
    function makeGraphData(stat) {    
     var stats = []
     //$scope.active_player_data.stats[index].single_game_stats[stat] > 0 --- this was in if statement for some reason
     for (var index in $scope.active_player_data.stats) {
      if ($scope.active_player_data.stats[index].game.season_type == 'Regular') {
       stats.push({'stat': $scope.active_player_data.stats[index].
                                  single_game_stats[stat], 
                   'week': $scope.active_player_data.stats[index].
                                  game.week})
          } //end if
        } // end for
     stats.sort(function(a,b) { return a.week - b.week })
     $scope.weekstats = stats
    }//end makeGraphData()
    
    $scope.order_weeks = function(game) {
        var week = parseInt(game.game.week)
        if (game.game.season_type == 'Preseason'){
          week = week - 5
          }
        if (game.game.season_type == 'Postseason'){
          week = week + 20
        }
        return week
    } //end order_weeks()

    }//end controller    
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
        })
      }
      get_data()
      
      $scope.statChoice = function(stat) {
        makeGraphData(stat)
      }
     
      function makeGraphData(stat) {    
        $scope.stats = []
        for (var index in $scope.players) {
          if ($scope.players[index].stats[stat] > 0) {
            $scope.stats.push({'player': $scope.players[index].player.full_name, 
                               'stat':   $scope.players[index].stats[stat]});
  //          sum_yds += $scope.players[index].stats.receiving_yds
          } //end if
        } // end for
    }//end makeGraphData()
      
    })
  
