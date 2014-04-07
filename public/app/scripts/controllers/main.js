'use strict';

angular.module('angularApp')
  .run(function($rootScope){
    $rootScope.multiples = { 'passing_yds': 25,
                             'passing_int': -1,
                             'passing_tds': 4,
                             'receiving_yds': 10,
                             'receiving_tds': 6,
                             'receiving_rec': 0.5,
                             'rushing_yds': 10,
                             'rushing_tds': 6
                            }
  })
  .controller('MainCtrl', function ($scope, $rootScope, apiutils) {
    
    $scope.positions = {'QB':true,
                        'RB':true,
                        'WR':true,
                        'TE':true}

    var get_data = function(urlparams) {
      $scope.disabled = true
      apiutils.get('/players/'+ urlparams).then(function(response) {
        $scope.disabled = false
        $scope.players = response.data;
        console.log($scope.players)
        if (($scope.players[0].rushing_yds+$scope.players[0].receiving_tar)%1 != 0) {
          $scope.numfilter = 2
        }
        else {
          $scope.numfilter = 0
        }
        
      })
    }
    
     $scope.sort_weeks = function(val) {
      return 0
      }
    
    $scope.weeks = []
    var init = function() {
      for (var i= 1; i<=17; i++) {
        $scope.weeks.push({
          'week':i,
          "value":true
        })
        }
    }()
    
   
    
    var valid_stat_keys = ['passing_yds', 'passing_int', 'passing_tds',
                               'receiving_yds', 'receiving_tds', 'receiving_rec',
                               'rushing_yds', 'rushing_tds']
    
    $scope.multipliers = function(stat, value) {
      var computed_multiples = {
       'passing_yds': 1/$rootScope.multiples['passing_yds'], 
       'passing_int': $rootScope.multiples['passing_int'],
       'passing_tds': $rootScope.multiples['passing_tds'],
       'receiving_yds': 1/$rootScope.multiples['receiving_yds'],
       'receiving_tds': $rootScope.multiples['receiving_tds'],
       'receiving_rec': $rootScope.multiples['receiving_rec'],
       'rushing_yds': 1/$rootScope.multiples['rushing_yds'],
       'rushing_tds': $rootScope.multiples['rushing_tds'],
      }

      return computed_multiples[stat] * value
    }
    
    $scope.position_check = function(value) {
      var pos = ''
      for (var key in $scope.positions) {
        if ($scope.positions[key]) {
          pos += key
        }
      }
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
    
    $scope.is_sum = true;
    $scope.sum_or_avg = function() {
      $scope.is_sum = !$scope.is_sum
      get_data(make_url())
    }
    
    $scope.is_red_zone = false
    $scope.onePosition = false
    var make_url = function() {
      var urlParams
      var pos = ''
      for (var key in $scope.positions) {
        if ($scope.positions[key]) {
          pos += key
        }
      }
      
      $scope.onePosition = (pos.length == 2) ? true: false;
      
      urlParams = '?position=' + pos
      if ($scope.is_red_zone) {
        urlParams = urlParams + '&red_zone=yes'
      }
      
      if ($scope.page > 0){
        urlParams += '&page=' + $scope.page
      }
      var omit_weeks = '0'
      for (var week in $scope.weeks){
        if (!$scope.weeks[week].value) {
          if (omit_weeks != '0') {
            omit_weeks += ',' + $scope.weeks[week].week
          }
          else {
            omit_weeks = $scope.weeks[week].week
          }
        }
      }
      urlParams += '&omit_weeks='+omit_weeks
      urlParams += '&is_sum=' + $scope.is_sum
      
      return urlParams
    }
    
    $scope.red_zone = function() {
      $scope.is_red_zone = !$scope.is_red_zone
      var url = make_url()
      get_data(url)
    }
    
    get_data(make_url())
  })
  .controller('gridCtrl', function ($scope, apiutils) {
    
    var players_to_graph = []

    $scope.get_single_player = function(player_id) {
      $scope.show_compare = false;
      players_to_graph = []
      $scope.active_player = player_id
      apiutils.get('players/'+player_id).then(function(response){
        $scope.active_player_data = response.data
        console.log(response.data)
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
      $scope.show_compare = true;
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
        urlParams = $scope.is_weekly ? '/teams/as_weekly/?team='+$routeParams.id 
          + ($scope.is_red_zone ? '&red_zone=yes' : '&red_zone=no')
          : '/teams/'+$routeParams.id + ($scope.is_red_zone ? '?red_zone=yes' : '?red_zone=no')
        return urlParams
      }
      
      $scope.red_zone = function() {                            //togglers
        $scope.is_red_zone = !$scope.is_red_zone
        dispatch()
       }      
      
      $scope.is_weekly_toggle = function() {
        $scope.is_weekly = !$scope.is_weekly
        if ($scope.is_weekly){
          $scope.weekly_stat = $scope.stat
        }
        dispatch()
      }
      
      $scope.statChoice = function(stat) {
        if ($scope.is_weekly) {
          $scope.weekly_stat = stat
        }
        else {
          $scope.stat = stat
        }
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
        if ($scope.is_red_zone && $scope.is_weekly && $scope.rz_weekly_players) {
           makeStackGraphData($scope.stat)
        }
        if ($scope.is_red_zone && $scope.is_weekly && !$scope.rz_weekly_players) {
           get_data(true)
        } 
        if (!$scope.is_red_zone && $scope.is_weekly && $scope.weekly_players) {
          makeStackGraphData($scope.stat)
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
        $scope.stackstats = []
        var player_objects 
        if ($scope.is_red_zone) {
          player_objects = $scope.rz_weekly_players
        }
        else {
          player_objects = $scope.weekly_players
        }
        for (var i=1; i<=17; i++){
          var week_grouped_players = []

          for (var key in player_objects) {
            if(player_objects[key].week == i) {
              week_grouped_players.push(player_objects[key])
            }
          }
          if (week_grouped_players.length>0) {
          $scope.stackstats.push({week:i,
                           stat: week_grouped_players})
          }
        }
      }
        
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
          if (player_objects[index][stat] > 0) {
            $scope.stats.push({'player': player_objects[index].full_name, 
                               'stat':   player_objects[index][stat]});
          } //end if
        } // end for
      }//end makeGraphData()
    
    $scope.is_normalize = false
      
    $scope.toggle_normalize = function() {
      makeStackGraphData($scope.stat) 
      $scope.is_normalize = !$scope.is_normalize
    }
      
    })
  
