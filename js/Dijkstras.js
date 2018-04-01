// taken from: https://github.com/mburst/dijkstras-algorithm and modified to work 2-100 times faster

/**
 * Basic priority queue implementation. If a better priority queue is wanted/needed,
 * this code works with the implementation in google's closure library (https://code.google.com/p/closure-library/).
 * Use goog.require('goog.structs.PriorityQueue'); and new goog.structs.PriorityQueue()
 */
function PriorityQueue () {
  this._nodes = [];

  this.enqueue = function (priority, key) {
    this._nodes.push({key: key, priority: priority });
  };
  this.dequeue = function () {
    return this._nodes.shift().key;
  };
  this.sort = function () {
    this._nodes.sort(function (a, b) {
      return a.priority - b.priority;
    });
  };
  this.isEmpty = function () {
    return !this._nodes.length;
  };
}

/**
 * Pathfinding starts here
 */
function Graph(){
  var INFINITY = 1/0;
  this.vertices = {};

  this.addVertex = function(name, edges){
    this.vertices[name] = edges;
  };

  // this.shortestPath = function (start, finish, max) {
  this.isConnected = function (start, finish, max) {
    var nodes = new PriorityQueue(),
        distances = {},
        previous = {},
        smallest, vertex, neighbor, alt;

    var now = window.performance.now();
    for(vertex in this.vertices) {
      if(vertex === start) {
        distances[vertex] = 0;
        nodes.enqueue(0, vertex);
      }
      else {
        distances[vertex] = INFINITY;
        nodes.enqueue(INFINITY, vertex);
      }

      // previous[vertex] = null;
    }
    nodes.sort();
    // console.log('filling queue took', window.performance.now() - now, nodes._nodes, distances);
    var now = window.performance.now();


    while(!nodes.isEmpty()) {
      smallest = nodes.dequeue();

      if (max != undefined && distances[smallest] > max) {
        break;
      }

      if(!smallest || distances[smallest] === INFINITY){
        continue;
      }

      if (smallest == finish) {
        return true;
        var step = smallest;
        var path = [];

        while(previous[step]) {
          path.push(step);
          step = previous[step];
        }
        return path;
      }

      for(neighbor in this.vertices[smallest]) {
        alt = distances[smallest] + this.vertices[smallest][neighbor];

        if(alt < distances[neighbor]) {
          distances[neighbor] = alt;
          previous[neighbor] = smallest;

          nodes.enqueue(alt, neighbor);
        }
      }
      nodes.sort();
    }

    // console.log('pathfinding took', window.performance.now() - now, previous);

    return false;
  };

  this.nodesInRange = function(start, range) {
    var nodes = new PriorityQueue(),
        distances = {},
        in_range_map = {},
        smallest, vertex, neighbor, alt;

    // var now = window.performance.now();
    for(vertex in this.vertices) {
      if(vertex === start) {
        distances[vertex] = 0;
        nodes.enqueue(0, vertex);
      }
      else {
        distances[vertex] = INFINITY;
        nodes.enqueue(INFINITY, vertex);
      }

      // previous[vertex] = null;
    }
    nodes.sort();
    // console.log('filling queue took', window.performance.now() - now);
    // var now = window.performance.now();


    while(!nodes.isEmpty()) {
      smallest = nodes.dequeue();

      if (range != undefined && distances[smallest] > range) {
        break;
      }

      if (!smallest || distances[smallest] === INFINITY){
        continue;
      }

      in_range_map[smallest] = true;

      for (neighbor in this.vertices[smallest]) {
        alt = distances[smallest] + this.vertices[smallest][neighbor];

        if (alt < distances[neighbor]) {
          distances[neighbor] = alt;

          nodes.enqueue(alt, neighbor);
        }
      }
      nodes.sort();
    }

    // console.log('pathfinding took', window.performance.now() - now, start, finishes, paths);

    return in_range_map;
  }
}

