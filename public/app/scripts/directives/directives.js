'use strict';

/* Directives */


angular.module('angularApp').

  directive('appVersion', function() {
    console.log('directib')
    return function(scope, elm, attrs) {
      console.log('directib')
    };
  })
  .directive('singlePlayer', function() {
    var single_player = {
        templateUrl:'app/views/singlePlayer.html',
        restrict: 'A',
        replace:true
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
          console.log(scope.data)
          maker()
        }
      })
      
    var maker = function(){
      d3Service.d3().then(function(d3) {
        
        var width = 960,
            height = 500,
            radius = Math.min(width, height) / 2;

        var color = d3.scale.ordinal()
           .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", 
                   "#a05d56", "#d0743c", "#ff8c00"]);
                   
        var arc = d3.svg.arc()
                  .outerRadius(radius - 10)
                  .innerRadius(radius - 170);
                  
        var pie = d3.layout.pie()
                  .sort(null)
                  .value(function(d) { return d.stats.receiving_yds; });
                  
        var svg = d3.select(".pie").append("svg")
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
      .style("fill", function(d) { return color(d.data.stats.receiving_yds); });
      
      g.append("text")
      .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
      .attr("dy", ".35em")
      .style("text-anchor", "middle")
      .text(function(d) { return d.data.player.full_name; });
//      scope.render(scope.data)
     });      
     }
      
    }
  }
});
  
