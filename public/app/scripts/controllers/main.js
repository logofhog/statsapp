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
    
    var players_to_graph = []

    $scope.get_single_player = function(player_id) {
      players_to_graph = []
      $scope.active_player = player_id
      apiutils.get('players/'+player_id).then(function(response){
        $scope.active_player_data = response.data
        players_to_graph.push($scope.active_player_data)
        }
      );
    }
      
    $scope.close = function() {
      $scope.active_player = ''
    }
    
    var check_for_duplicates = function(player) {
      for (var p in players_to_graph){
        if (players_to_graph[p].player.full_name == player.full_name){
          return false
        }
      }
      return true
    }

    $scope.addPlayer = function(to_add) {
      apiutils.get('players/'+to_add.id).then(function(response){
        if (check_for_duplicates(response.data.player)) {
          players_to_graph.push(response.data)
          makeGraphData($scope.active_stat)
        }
      });
    }

    $scope.players_choice_names = []
    $scope.get_auto_names = function(partial) {
      apiutils.get('playersearch/?query=' + partial).then(function(response){
        $scope.players_choice_names = response.data.map(function(p){return {'name': p.full_name, 'id': p.player_id}})
      })
      return $scope.players_choice_names
    }
    
    $scope.active_stat
    $scope.statChoice = function(stat) {
      $scope.active_stat = stat
      makeGraphData(stat)
    }
    
    $scope.players_on_graph = []
     
    function makeGraphData(stat) {    
     $scope.players_on_graph = []
     for (var player_g in players_to_graph) {
      var stats = []
       for (var index in players_to_graph[player_g].stats) {
          if (players_to_graph[player_g].stats[index].game.season_type == 'Regular') {
           stats.push({'stat': players_to_graph[player_g].stats[index].
                                      single_game_stats[stat], 
                       'week': players_to_graph[player_g].stats[index].
                                      game.week})
              } //end if
          } // end for
        stats.sort(function(a,b) { return a.week - b.week })
      
        $scope.players_on_graph.push({'player':players_to_graph[player_g].player.full_name,
                                          'stats': stats})
      }
      $scope.players_on_graph_data = $scope.players_on_graph
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
      $scope.is_red_zone = false;
      $scope.is_weekly = false;
      $scope.stat = ''
      var urlParams = ''
      var active_stat,
          rz_active_stat
      
      var make_url = function() {
        urlParams = $scope.is_weekly ? '/players/weekly/'+$routeParams.id : '/teams/'+$routeParams.id
        urlParams += $scope.is_red_zone ? '?red_zone=yes' : '?red_zone=no'
        urlParams += ($scope.stat !=='') ? '&stat=' + $scope.stat : ''
        return urlParams
      }
      
      $scope.red_zone = function() {                            //togglers
        $scope.is_red_zone = !$scope.is_red_zone
        dispatch()
       }      
      
      $scope.is_weekly_toggle = function() {
        $scope.is_weekly = !$scope.is_weekly
        dispatch()
      }
      
      $scope.statChoice = function(stat) {
        $scope.stat = stat
        dispatch()
      }
      
      var dispatch = function() {  //refactor this, want to find best way
        
        if (!$scope.is_red_zone && !$scope.is_weekly){
           makeGraphData($scope.stat)
        }
        if ($scope.is_red_zone && !$scope.is_weekly && $scope.rz_players){
           makeGraphData($scope.stat)
        }
        if ($scope.is_red_zone && !$scope.is_weekly && !$scope.rz_players){
           get_data(true)
        }
        if ($scope.is_red_zone && $scope.is_weekly && $scope.rz_weekly_players && ($scope.stat == rz_active_stat)) {
           makeStackGraphData($scope.stat)
        }
        if ($scope.is_red_zone && $scope.is_weekly && !$scope.rz_weekly_players && ($scope.stat != rz_active_stat)) {
           get_data(true)
        } 
        if ($scope.is_red_zone && $scope.is_weekly && $scope.rz_weekly_players && ($scope.stat != rz_active_stat)) {
          get_data(true)
        }
        if ($scope.is_red_zone && $scope.is_weekly && $scope.rz_weekly_players && ($scope.stat == rz_active_stat)) {
          makeStackGraphData($scope.stat)
        }
        if (!$scope.is_red_zone && $scope.is_weekly && $scope.weekly_players && ($scope.stat == active_stat)) {
          makeStackGraphData($scope.stat)
        }
        if (!$scope.is_red_zone && $scope.is_weekly && $scope.weekly_players && ($scope.stat !== active_stat)) {
          get_data(true)
        }
        if (!$scope.is_red_zone && $scope.is_weekly && !$scope.weekly_players) {
          get_data(true)
        }

      }
      
      var get_data = function(redraw) {
        var url = make_url()
        apiutils.get(url).then(function(response) {
          if (!$scope.is_weekly) {
              if (!$scope.is_red_zone){
                $scope.players = response.data
              }
              else {
                $scope.rz_players = response.data
              }
            }
          else {
            if (!$scope.is_red_zone){
                $scope.weekly_players = response.data
              }
              else {
                $scope.rz_weekly_players = response.data
              }
          }
          if (redraw) {
            if ($scope.is_weekly){
              makeStackGraphData($scope.stat)
            }
            else {
              makeGraphData($scope.stat)
            }
          }
        })
      }
      get_data()

      function makeStackGraphData(stat) {
        
        var by_week_stats = {}
        var player_objects = []
        if ($scope.is_red_zone) {
          player_objects = $scope.rz_weekly_players
          rz_active_stat =$scope.stat
        }
        else {
          player_objects = $scope.weekly_players
          active_stat = $scope.stat
        }
        for (var index in player_objects){
            for (var key in player_objects[index].stats){
              if (!(player_objects[index].stats[key].week in by_week_stats)){
                by_week_stats[player_objects[index].stats[key].week] = [{
                  'stat': player_objects[index].stats[key][stat],
                  'player': player_objects[index].player
                  }]
              }
              else {
                by_week_stats[player_objects[index].stats[key].week].push({
                  'stat': player_objects[index].stats[key][stat],
                  'player': player_objects[index].player
                  })
              }
            }
          }
        var tempstack = []
        for (var index in by_week_stats){
          tempstack.push({'week': index, 'stats': by_week_stats[index]})
        }
        $scope.stackstats = tempstack
      } // end makeStackGraphData
      
      function makeGraphData(stat) {    
        var player_objects = []
        if ($scope.is_red_zone) {
          player_objects = $scope.rz_players
        }
        else {
          player_objects = $scope.players
        }
        $scope.stats = []
        for (var index in player_objects) {
          if (player_objects[index].stats[stat] > 0) {
            $scope.stats.push({'player': player_objects[index].player.full_name, 
                               'stat':   player_objects[index].stats[stat]});
          } //end if
        } // end for
    }//end makeGraphData()
    
    $scope.is_normalize = false
      
    $scope.toggle_normalize = function() {
      makeStackGraphData($scope.stat) 
      $scope.is_normalize = !$scope.is_normalize
    }
      
    })
  
