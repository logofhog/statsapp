'use strict';

/* Directives */


angular.module('angularApp').
  directive('appVersion', function() {
    console.log('directib')
    return function(scope, elm, attrs) {
      console.log('directib')
    };
  })
  .directive('singlePlayer', function($compile) {
    var single_player = {
        templateUrl:'app/views/singlePlayer.html',
        restrict: 'EA'
    }
    return single_player
  })
  .directive('paginate', function() {
    var paginate = {
      templateUrl:'app/views/paginate.html'
    }
    return paginate
  })
  .directive('headerlinks', function() {
    var headerlinks = {
      templateUrl:'app/views/headerlinks.html'
    }
    return headerlinks
  })
  .directive('d3Bars', function(d3Service) {
    return {
      restrict: 'EA',
      scope: { data: '=data' },
      link: function(scope, element, attrs) {
        scope.$watch('data', function() {
          if (scope.data){
            console.log(scope.data)
            maker()
          }
        })
        
      var maker = function(){
        d3Service.d3().then(function(d3) {
          var svg = d3.select('.bars')
           .append('svg')
           .attr("width", '100%')

         scope.render = function(data) {
            svg.selectAll('*').remove()
            
            var width, height, max;
            width = 200;
            height = 2000;
            max = 98;
            
            svg.attr('height', height)
            
            svg.selectAll('rect')
              .data(scope.data)
              .enter()
                .append('rect')
                .attr('height', 20)
                .attr('width', function(d) {return  d.stats.receiving_yds  })
                .attr('y', function(d, i){
                  return i * 35
                })
         }
         scope.render(scope.data)
       });      
       }
        
      }
    }
  })
  .directive('d3Pie', function(d3Service) {
  return {
    restrict: 'EA',
    scope: { data: '=data',
             players: '=players'
           },
    link: function(scope, element, attrs) {
    
      scope.$watch('data', function() {
        if (scope.data){
         console.log(scope.data)
          maker()
        }
      })
      
    var maker = function(){
      d3Service.d3().then(function(d3) {
        var clear = d3.selectAll('svg').remove()
        
        var player_legend = []
        
        var width = 960,
            height = 500,
            radius = Math.min(width, height) / 2;

        var color = d3.scale.category20c().domain(scope.players.map(function(player){return player.player.full_name}))
                   
        var arc = d3.svg.arc()
                  .outerRadius(radius - 10)
                  .innerRadius(radius - 170);
                  
        var pie = d3.layout.pie()
                  .value(function(d) { return d.stat });
                  
        var svg = d3.select(".pie")
            .append("svg")
              .attr("width", width)
              .attr("height", height)
            .append("g")
              .attr("transform", "translate(300," + height / 2 + ")");
       
       var g = svg.selectAll(".arc")
              .data(pie(scope.data))
              .enter().append("g")
                .attr("class", "arc");
      
      g.append("path")
       .attr("d", arc)
       .style("fill", function(d) { return color(d.data.player); });
      
      g.append("text")
       .attr("transform", function(d) { 
                            return "translate(" + arc.centroid(d) + ")"; })
       .attr("dy", ".35em")
       .style("text-anchor", "middle")
       .text(function(d) {
          if ((d.endAngle - d.startAngle) > 0.5) {
            return d.data.player
          }
          else {
            player_legend.push(d.data.player)
          }
        });
        
        var legend = svg.selectAll('.legend')
                        .data(player_legend.reverse())
                      .enter().append('g')
                        .attr('class', 'legend')
                        .attr("transform", function(d, i) { return "translate(0," + (-200 + (i * 20)) + ")"; })
        
        legend.append("rect")
              .attr("x", 360)
              .attr("width", 28)
              .attr("height", 18)
              .style("fill", function(d) {return color(d)});
              
        legend.append("text")
              .attr("x", 350)
              .attr("y", 9)
              .attr("dy", ".35em")
              .style("text-anchor", "end")
              .style('fill', 'black')
              .text(function(d) { return d; });
//       .text(function(d) { return (d.data.player); });
//      scope.render(scope.data)
     });      
     }
      
    }
  }
})
.directive('d3LineChart', function(d3Service) {
  return {
    restrict: 'EA',
    scope: { stats: '=stats',
             player: '=player' 
    },
    link: function(scope, element, attrs) {
      scope.$watch('stats', function() {
        if (scope.stats){
//          console.log(scope.stats)
          maker()
        }
      })

    var maker = function(){

      d3Service.d3().then(function(d3) {
        var margin = {top: 20, right: 50, bottom: 20, left: 50};
        var w = 960 - margin.left - margin.right,
            h = 500 - margin.top - margin.bottom;
            
        var y = d3.scale.linear().domain([0, get_max()]).range([h - margin.top - margin.bottom, 0 + margin.top - margin.bottom]),
            x = d3.scale.linear().domain([1, 17]).range([0 + margin.top - margin.bottom, w - margin.left - margin.right])

        var clear = d3.selectAll('svg').remove()
        
        var xAxis = d3.svg.axis().scale(x).ticks(17).tickSize(-h+(margin.top+margin.bottom))
        var yAxis = d3.svg.axis().scale(y).tickSize(-w+(margin.left+margin.right)).orient("left");
        
//        var svg = d3.select("'." + scope.player + "'")
        var svg = d3.select('.active_graph')
                    .append('svg')
                    .attr("width", w )
                    .attr("height", h + margin.top + margin.bottom)
                  .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
//                    .attr("transform", "translate(0, 200)");
        var line = d3.svg.line()
//                     .x(function(d, i) {return x(d.week);})
                     .x(function(d, i) {return x(d.week);})
                     .y(function(d) {return y(d.stat);})
                     .interpolate("monotone")
        
        var graph = svg.selectAll('.player')
            .data(scope.stats)
            .enter().append('g')
//            .attr('d', function(d) {console.log(d.stats)})
//            .attr('d', line(function(d) {return d.stats}))                    
//            .attr('stroke', 'blue')
//            .attr('fill', 'none')
//            

        graph.append("path")
          .attr('d', function(d) {return line(d.stats)})
          .style("stroke", 'black')
          
        var point = graph.append('g')
            
        point.selectAll('circle')
          .data(function(d) {return d.stats})
          .enter().append('circle')
          .attr("stroke", "black")
          .attr("r", 4)
          .attr('cx', function(d,i){return x(d.week)})
          .attr('cy', function (d) {return y(d.stat)})
          
//        var points = svg.selectAll('circle')
//                        .attr("stroke", "black")
//                        .data(scope.stats)
//                        .enter()
//                        .append('circle')
//                        .attr('d', function (d){return d.stats})
//        
//        points.selectAll('circle')
//                        .enter().append('circle')
//                        .attr("stroke", "black")
//                        .attr("r", 4)
//                        .attr('cx', function(d,i){return x(d.week)})
//                        .attr('cy', function (d) {return y(d.stat)})

            
        var xAxisGroup = svg.append('g')
                            .attr("transform", "translate(0," + (h - margin.top- margin.bottom) + ")")
                            .call(xAxis)
        var yAxisGroup = svg.append('g')
//                            .attr("transform", "translate(" + (margin.left) + ",0)")
//                            .attr('opacity', 0.5)
                            .call(yAxis)
                            
     });      
     }
     
     var get_max = function() {
      var max_value = 0;
      for (var index in scope.stats){
        for (var stat in scope.stats[index].stats){
          stat = parseInt(scope.stats[index].stats[stat].stat)
          if (stat > max_value) {
            max_value = stat
          }
        }
      }
      return max_value * 1.1
     }
      
    }
  }
})
.directive('d3Stacked', function(d3Service) {
  return {
    restrict: 'EA',
    scope: { data: '=data',
             players: '=players',
             normalize: '=normalize'
           },
//    template: '<button ng-show="data" ng-model="is_normalized">normalize</button>',
    link: function(scope, element, attrs) {
    
      scope.$watch('data', function() {
        if (scope.data){
          maker()
        }
      })
      
      scope.$watch('normalize', function() {
        if (scope.data){
          maker()
        }
      })
    
    var maker = function(){
      var is_normal = scope.normalize;
      var temp_data = scope.data

      d3Service.d3().then(function(d3) {
        var clear = d3.selectAll('svg').remove()
        var clearrect = d3.selectAll('rect').remove()
        var max_stat = 0;
        var player_names = []

        var margin = {top: 20, right: 10, bottom: 20, left: 50};
        var w = 960 - margin.left - margin.right,
            h = 500 - margin.top - margin.bottom;
            
        if (is_normal) {
          var y = d3.scale.linear().range([h, 0]).domain([0, 1])
        }
        else {
          var y = d3.scale.linear().range([h, 0])
        }
        
        var x = d3.scale.linear().domain([1, 17]).range([0 + margin.top - margin.bottom, (w - margin.left - margin.right)*.75])
        
        var color = d3.scale.category20c().domain(scope.players.map(function(player){return player.player.full_name}))
        
        var xAxis = d3.svg.axis().scale(x).ticks(17)
        
        if (is_normal){
          var yAxis = d3.svg.axis().scale(y)
                    .tickSize((-w+(margin.left+margin.right))*.79).orient("left")
                    .tickFormat(d3.format(".0%"));
                    }
        else {
          var yAxis = d3.svg.axis().scale(y).ticks(10)
                    .tickSize((-w+(margin.left+margin.right))*.79).orient("left")
        }
        
        var svg = d3.select('.active_graph')
                    .append('svg')
                    .attr("width", w)
                    .attr("height", h + margin.top + margin.bottom)
                  .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")


        var rect = svg.selectAll('.week')
                      .data(temp_data)
                    .enter().append('g')
                      .attr('transform', function(d) {return "translate(" + x(d.week) + ",0)"})
                      
                      
        rect.selectAll('rect')
            .data(function(d) {
              d.stats.forEach(function(e, i){
                if (player_names.indexOf(e.player) ==-1){
                  player_names.push(e.player)
                }
                if (i>0){
                  d.stats[i]['prev'] = d.stats[i-1]['stat'] + d.stats[i-1]['prev']
                }
                else {
                  d.stats[i]['prev'] = 0;
                }
              })
              
              var total = d.stats[d.stats.length-1].stat + d.stats[d.stats.length-1].prev
              max_stat = Math.max(total, max_stat)
              if (is_normal) {
                d.stats.forEach(function(a) {
                  a.stat /= total
                  a.prev /= total
                })
              }
              else{
                y.domain([0, max_stat*1.15])
              }
              return d.stats})
          .enter().append('rect')          
            .attr('width', '35')
            .attr('y', function(d) { return y(d.prev + d.stat)})
            .attr("height", function(d) { return h-y(d.stat); })
            .style("fill", function(d) {return color(d.player)})

        var xAxisGroup = svg.append('g')
                            .attr("transform", "translate(20," + (h) + ")")
                            .call(xAxis)
        var yAxisGroup = svg.append('g')
                            .call(yAxis)
                            
        var legend = svg.selectAll('.legend')
                        .data(player_names.reverse())
                      .enter().append('g')
                        .attr('class', 'legend')
                        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; })
        
        legend.append("rect")
              .attr("x", w - margin.right-margin.left-10)
              .attr("width", 28)
              .attr("height", 18)
              .style("fill", function(d) {return color(d)});
              
        legend.append("text")
              .attr("x", w - margin.right-margin.left-10)
              .attr("y", 9)
              .attr("dy", ".35em")
              .style("text-anchor", "end")
              .style('fill', 'black')
              .text(function(d) { return d; });
       
//        var normalize_button = svg.append('text')
//                                  .attr("x", w - 200)
//                                  .attr("y", h-50)
//                                  .attr("width", 150)
//                                  .attr("height", 40)
//                                  .style('fill', 'black')
//                                  .text("Normalize")
//                                  .attr("class", "normalize_button")

                                  
     });      
     }
      
    }
  }
});
  
