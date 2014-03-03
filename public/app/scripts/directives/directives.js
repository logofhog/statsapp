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
        restrict: 'EA',
//        replace:true,
//        link: function(scope, element, attrs) {
//          var clicked = false
//          element.bind('click', function() { 
//            if (!clicked) {
//              console.log(scope.active_player_data)
//              clicked = true
//              var newElem = angular.element('<div d3_line_chart stats="weekstats" player_id = {{active_player.player_id}} class = "{{scope.active_player_data.player_id}}"></div>')
//              element.append(newElem);
//              $compile(newElem)(scope);
//              }
//            })
//        }
    }
    return single_player
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
    scope: { data: '=data' },
    link: function(scope, element, attrs) {
    
      scope.$watch('data', function() {
        if (scope.data){
//          console.log(scope.data)
          maker()
        }
      })
      
    var maker = function(){
      d3Service.d3().then(function(d3) {
        var clear = d3.selectAll('svg').remove()
        
        var width = 960,
            height = 500,
            radius = Math.min(width, height) / 2;

        var color = d3.scale.category20c()
                   
        var arc = d3.svg.arc()
                  .outerRadius(radius - 10)
                  .innerRadius(radius - 170);
                  
        var pie = d3.layout.pie()
//                  .sort(null)
                  .value(function(d) { return d.stat });
                  //  .value(function(d) { return d.stats.receiving_yds; });
                  
        var svg = d3.select(".pie")
            .append("svg")
              .attr("width", width)
              .attr("height", height)
            .append("g")
              .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
       
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
       .text(function(d) { return (d.data.player); });
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
      console.log(scope.player)
      scope.$watch('stats', function() {
        if (scope.stats){
          maker()
          console.log(scope.stats)
        }
      })

    var maker = function(){

      d3Service.d3().then(function(d3) {
        var w = 900,
            h = 400,
            margin = 30
        var y = d3.scale.linear().domain([0, get_max()]).range([h - margin, 0 + margin]),
            x = d3.scale.linear().domain([1, 17]).range([0 + margin, w - margin])

        var clear = d3.selectAll('svg').remove()
        
        var xAxis = d3.svg.axis().scale(x).ticks(17).tickSize((-h))
        var yAxis = d3.svg.axis().scale(y).tickSize(-w).orient("left");
        
//        var svg = d3.select("'." + scope.player + "'")
        var svg = d3.select('.active_graph')
                    .append('svg')
                    .attr('width', w+100)
                    .attr('height', h)
//                    .attr("transform", "translate(0, 200)");
        var line = d3.svg.line()
                     .x(function(d, i) {return x(d.week);})
                     .y(function(d) {return y(d.stat);});
        
        var graph = svg.append('svg:path')
            .attr('d', line(scope.stats))                    
            .attr('stroke', 'blue')
            .attr('fill', 'none')
            
        var circle = svg.selectAll('circle')
                        .attr("stroke", "black")
                        .data(scope.stats)
                        .enter()
                        .append('svg:circle')
                        .attr("stroke", "black")
                        .attr("r", 4)
                        .attr('cx', function(d,i){return x(d.week)})
                        .attr('cy', function (d) {return y(d.stat)})

            
        var xAxisGroup = svg.append('g')
                            .attr("transform", "translate(0," + (h - margin) + ")")
                            .call(xAxis)
        var yAxisGroup = svg.append('g')
                            .attr("transform", "translate(" + (margin) + ",0)")
//                            .attr('opacity', 0.5)
                            .call(yAxis)
                            
     });      
     }
     
     var get_max = function() {
      var max_value = 0;
      for (var stat in scope.stats){
        stat = parseInt(scope.stats[stat].stat)
        if (stat > max_value) {
          max_value = stat
        }
      }
      return max_value
     }
      
    }
  }
})
;
  
