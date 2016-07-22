var Router = function () {
    this.buses 		= Buses;
    this.penalty 	= 1000; /** 1km penalty for changing buses */ 
};

/** stolen off http://stackoverflow.com/a/14438954 */
Router.prototype.unique = function(array) {
	return array.filter(function(item, pos) {
		return array.indexOf(item) == pos;
	});
};

/** stolen off http://stackoverflow.com/a/1885569 */
Router.prototype.intersect = function(array1, array2) {
	return this.unique(array1.filter(function(n) {
		return array2.indexOf(n) != -1;
	}));
};

/** get distance from start node to end node on a route */
Router.prototype.getDistance = function(route, from, to) {
	if(!this.buses.routes.hasOwnProperty(route)) {
		return 1/0;
	}

	return Math.max(this.buses.routes[route].stopsfrom[to] - this.buses.routes[route].stopsfrom[from],
		this.buses.routes[route].stopsto[to] - this.buses.routes[route].stopsto[from]);
};

/** 
	see if an end node is reachable from a start node on a given route.
	distance of the end node should be greater than the start node
*/
Router.prototype.reachable = function(route, from, to) {
	return this.buses.routes.hasOwnProperty(route) && 
		(this.buses.routes[route].stopsfrom[to] > this.buses.routes[route].stopsfrom[from] ||
		this.buses.routes[route].stopsto[to] > this.buses.routes[route].stopsto[from]);
};


/** find stops that can be reached from a given stop on a given route */
Router.prototype.findReachableStops = function(route, stop) {
	var stops = [];
	if(this.buses.routes.hasOwnProperty(route) && 
	this.buses.routes[route].stopsfrom.hasOwnProperty(stop)) {
		var startdist = this.buses.routes[route].stopsfrom[stop];
		for(var s in this.buses.routes[route].stopsfrom) {
			if(this.buses.routes[route].stopsfrom[s] > startdist) {
				stops.push(s);
			}
		}
	}

	if(this.buses.routes.hasOwnProperty(route) && 
	this.buses.routes[route].stopsto.hasOwnProperty(stop)) {
		var startdist = this.buses.routes[route].stopsto[stop];
		for(var s in this.buses.routes[route].stopsto) {
			if(this.buses.routes[route].stopsto[s] > startdist) {
				stops.push(s);
			}
		}
	}

	return this.unique(stops);
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

	return this.unique(routes);
};

/** find single bus routes between two nodes */
Router.prototype.findSingleRoutes = function(from, to) {
	var _self = this;

	var fromRoutes 	= this.findStopRoutes(from); /** bus routes passing through start node */
	var toRoutes 	= this.findStopRoutes(to); /** bus routes passing through end node */	

	return this.intersect(fromRoutes, toRoutes).filter(function(r) { return _self.reachable(r, from, to); });
};

/** find routes between two nodes */
Router.prototype.findRoutes = function(from, to) {
	if(from === to) return { error: 'Source and destination same'};

	var fromRoutes 	= this.findStopRoutes(from); /** bus routes passing through start node */
	var toRoutes 	= this.findStopRoutes(to); /** bus routes passing through end node */

	/** try to find a single route from start node to end node, and return */
	var singleRoute = this.findSingleRoutes(from, to);

	if(singleRoute.length > 0) {
		singleRoute = singleRoute.sort(function(a, b) {
			return a.distance - b.distance;
		});

		var distance = this.getDistance(singleRoute[0], from, to);
		return [{
			from 	: from,
			routes 	: [
				{ routes: singleRoute.slice(0, 5), distance: distance }
			],
			changes : [],
			to 		: to,
			distance: distance
		}];
	}
	else {
		/** 
			if not found, try to find reachable nodes from the first route, and 
			from the second route, and any intersecting stops 
		*/
		var fromStops = [], toStops = [], toc, fromc, distances, multiRoutes = [], _self = this;
		fromRoutes.forEach(function(fr) {
			fromStops = fromStops.concat(_self.findReachableStops(fr, from));
		});

		toRoutes.forEach(function(tr) {
			toStops = toStops.concat(_self.findReachableStops(tr, to));
		});

		/** 
			2 bus: find intersecting stops, and routes to take you from your starting node 
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

			multiRoutes.push({
				from 	: from,
				routes 	: [
					{ routes: toc, 		distance: distances[0] },
					{ routes: fromc, 	distance: distances[1] }
				],
				changes : [c],
				to 		: to,
				distance: distances[0] + distances[1]
			});
		});

		if(common.length < 3) {
			/** 
				3 bus: find reachable stops from start and end nodes, and find 
				routes connecting some nodes within those two sets
			*/
			fromStops.forEach(function(fs) {
				toStops.forEach(function(ts) {
					tots	= _self.findSingleRoutes(fs, ts);
					if(tots.length > 0) {
						tofs	= _self.findSingleRoutes(from, fs);
						fromts 	= _self.findSingleRoutes(ts, to);

						distances 	= [
							_self.getDistance(tofs[0], from, fs),
							_self.getDistance(tots[0], fs, ts),
							_self.getDistance(fromts[0], ts, to)
						];

						multiRoutes.push({
							from 	: from,
							routes 	: [
								{ routes: tofs, 	distance: distances[0] },
								{ routes: tots, 	distance: distances[1] },
								{ routes: fromts, 	distance: distances[2] }
							],
							changes : [fs, ts],
							to 		: to,
							distance: distances[0] + distances[1] + distances[2]
						});
					}
				});
			});
		}

		if(multiRoutes.length > 0) {
			multiRoutes = multiRoutes.filter(function(n) { 
				return !Number.isNaN(n.distance); 
			}).sort(function(a, b) {
				return (a.routes.length - b.routes.length) * _self.penalty + (a.distance - b.distance);
			});
			return multiRoutes.slice(0, 5);
		}
	}
};

Router.prototype.getPlaceDetails = function(pid) {
	return this.buses.places[pid];
};

Router.prototype.getRouteDetails = function(id) {
	return this.buses.routes[id];
};

Router.prototype.getAllPlaces = function() {
	var places = [];
	for(var p in this.buses.places) {
		places.push({ value: this.buses.places[p].name, data: p });
	}
	return places;
};
