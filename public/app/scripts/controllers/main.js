'use strict';

angular.module('angularApp')
  .controller('MainCtrl', function ($scope, apiutils) {
    
    $scope.positions = {'QB':true,
                    'RB':true,
                    'WR':true,
                    'TE':true}
                    
    var get_data = function(urlparams) {
      $scope.disabled = true
      apiutils.get('/players/'+ urlparams).then(function(response) {
        $scope.players = response.data;
      })
    }
    
    $scope.position_check = function(value) {
      $scope.disabled = false
      var pos = ''
      for (var key in $scope.positions) {
        if ($scope.positions[key]) {
          pos += key
        }
      }
    }
    
    $scope.get_position_test = function() {
      var uparams = '?position=wr&position=rb'
      apiutils.get('/players/'+ uparams).then(function(response) {
        $scope.players = response.data;
    })
    }
    
    $scope.update_position = function() {
      var url = make_url()
      get_data(url)
    }
    $scope.page = 0
    
    $scope.paginate = function(action) {
      if (action==0){
        $scope.page = 0
      }
      else {
        $scope.page +=action
      }
      var url = make_url()
      get_data(url)
    }
    
    $scope.is_red_zone = false
   
    var make_url = function() {
      var urlParams
      var pos = ''
      for (var key in $scope.positions) {
        if ($scope.positions[key]) {
          pos += key
        }
      }
      urlParams = '?position=' + pos
      if ($scope.is_red_zone) {
        urlParams = urlParams + '&red_zone=yes'
      }
      
      if ($scope.page > 0){
        urlParams += '&page=' + $scope.page
      }
      return urlParams
    }
    
    $scope.red_zone = function() {
      $scope.is_red_zone = !$scope.is_red_zone
      var url = make_url()
      get_data(url)
    }
    
    get_data('?position=QBRBWRTE')
  })
  .controller('gridCtrl', function ($scope, apiutils) {
    $scope.get_single_player = function(player_id) {
      $scope.active_player = player_id
      apiutils.get('players/'+player_id).then(function(response){
        $scope.active_player_data = response.data
//        console.log(response.data.stats)
        }
      );
      }
    $scope.close = function() {
      $scope.active_player = ''
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
      $scope.is_red_zone = false
      var urlParams = ''
      $scope.red_zone = function() {
        $scope.is_red_zone = !$scope.is_red_zone
        urlParams = $scope.is_red_zone ? '?red_zone=yes' : ''
        get_data(true)
      }      
      
      var get_data = function(redraw) {
        apiutils.get('/teams/'+$routeParams.id+urlParams).then(function(response) {
          $scope.players = response.data
          console.log($scope.players)
          if (redraw){
            makeGraphData($scope.stat)
          }
        })
      }
      get_data()
      
      $scope.statChoice = function(stat) {
        $scope.stat = stat
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
  
