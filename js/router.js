var Router = function () {
    this.buses = Buses;
};

/** stolen off http://stackoverflow.com/a/1885569 */
Router.prototype.intersect = function(array1, array2) {
	return array1.filter(function(n) {
		return array2.indexOf(n) != -1;
	});
};

/** sort array by distance */
Router.prototype.sortByDistance = function(a, b) {
	return a.distance - b.distance;
};

/** get distance from start node to end node on a route */
Router.prototype.getDistance = function(route, from, to) {
	return Math.max(this.buses.routes[route].stopsfrom[to] - this.buses.routes[route].stopsfrom[from],
		this.buses.routes[route].stopsto[to] - this.buses.routes[route].stopsto[from]);
};

/** 
	see if an end node is reachable from a start node on a given route.
	distance of the end node should be greater than the start node
*/
Router.prototype.reachable = function(route, from, to) {
	return this.buses.routes[route].stopsfrom[to] > this.buses.routes[route].stopsfrom[from] ||
		this.buses.routes[route].stopsto[to] > this.buses.routes[route].stopsto[from];
};


/** find stops that can be reached from a given stop on a given route */
Router.prototype.findReachableStops = function(route, stop) {
	var stops = [];
	if(this.buses.routes[route].stopsfrom.hasOwnProperty(stop)) {
		var startdist = this.buses.routes[route].stopsfrom[stop];
		for(var s in this.buses.routes[route].stopsfrom) {
			if(this.buses.routes[route].stopsfrom[s] > startdist) {
				stops.push(s);
			}
		}
	}

	if(this.buses.routes[route].stopsto.hasOwnProperty(stop)) {
		var startdist = this.buses.routes[route].stopsto[stop];
		for(var s in this.buses.routes[route].stopsto) {
			if(this.buses.routes[route].stopsto[s] > startdist) {
				stops.push(s);
			}
		}
	}

	return stops;
};

/** find routes that pass through the given stop */
Router.prototype.findStopRoutes = function(stop) {
	var routes = [];
	for(var r in this.buses.routes) {
		if(this.buses.routes[r].stopsfrom.hasOwnProperty(stop) ||
		this.buses.routes[r].stopsto.hasOwnProperty(stop)) {
			routes.push(r);
		}
	}

	return routes;
};

/** find single bus routes between two nodes */
Router.prototype.findSingleRoutes = function(from, to) {
	var _self = this;

	var fromRoutes 	= this.findStopRoutes(from); /** bus routes passing through start node */
	var toRoutes 	= this.findStopRoutes(to); /** bus routes passing through end node */	

	return this.intersect(fromRoutes, toRoutes)
		.filter(function(r) { return _self.reachable(r, from, to); });
};

/** find routes between two nodes */
Router.prototype.findRoutes = function(from, to) {
	if(from === to) return { error: 'Source and destination same'};

	var fromRoutes 	= this.findStopRoutes(from); /** bus routes passing through start node */
	var toRoutes 	= this.findStopRoutes(to); /** bus routes passing through end node */

	/** try to find a single route from start node to end node, and return */
	var singleRoute = this.findSingleRoutes(from, to);

	if(singleRoute.length > 0) {
		return {
			from 	: from,
			to 		: to,
			routes 	: singleRoute,
			distance: this.getDistance(singleRoute[0], from, to)
		};
	}
	else {
		/** 
			if not found, try to find reachable nodes from the first route, and 
			from the second route, and any intersecting stops 
		*/
		var fromStops = [], toStops = [], toc, fromc, distances, doubleRoutes = [], _self = this;
		fromRoutes.forEach(function(fr) {
			fromStops = fromStops.concat(_self.findReachableStops(fr, from));
		});

		toRoutes.forEach(function(tr) {
			toStops = toStops.concat(_self.findReachableStops(tr, to));
		});

		/** 
			find intersecting stops, and routes to take you from your starting node 
			to your intersection, and from the intersection to the end stop
		*/
		common = this.intersect(fromStops, toStops);
		common.forEach(function(c) {
			toc 		= _self.findSingleRoutes(from, c);
			fromc 		= _self.findSingleRoutes(c, to);
			distances 	= [
				_self.getDistance(toc[0], from, c),
				_self.getDistance(fromc[0], c, to)
			];

			doubleRoutes.push({
				from 	: from,
				routes 	: [
					{ routes: toc, 		distance: distances[0] },
					{ routes: fromc, 	distance: distances[1] }
				],
				change 	: c,
				to 		: to,
				distance: distances[0] + distances[1]
			});
		});

		if(doubleRoutes.length > 0) {
			return doubleRoutes.sort(this.sortByDistance)
		}
	}
};

Router.prototype.getPlaceDetails = function(pid) {
	return this.buses.places[pid];
};
