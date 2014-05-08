var Router = {
	findRoute: function(pid1, pid2) {
		if(pid1 == pid2) return;
		
		var pid1Groups = [], pid2Groups = [];
		
		for(var key in Buses.groups) {
			for(var i = 0; i < Buses.groups[key].stops.length; i++) {
				if(pid1 == Buses.groups[key].stops[i]) {
					pid1Groups.push(key);
				}
				
				if(pid2 == Buses.groups[key].stops[i]) {
					pid2Groups.push(key);
				}
			}
		}
		
		var result = {		from	: Router.getPlaceDetail(pid1),
							to		: Router.getPlaceDetail(pid2),
							routes	: [] };
							
		var commonGroup = _.intersection(pid1Groups, pid2Groups);
		if(commonGroup.length > 0) {
			console.log('Single bus group found! Opts: ' + commonGroup.length);
			_.forEach(commonGroup, function(groupid) { 
				result.routes.push({	buses		: Router.renderOneBusRouteDetail(pid1, pid2, groupid),
										changeovers	: [] }); 
			});
		}
		else {
			/** two bus territory */
			var commonStops = [], bus1, bus2;
			for(var i = 0; i < pid1Groups.length; i++) {
				for(var j = 0; j < pid2Groups.length; j++) {
					commonStops = _.intersection(Buses.groups[pid1Groups[i]].stops, Buses.groups[pid2Groups[j]].stops);
					_.forEach(commonStops, function(stop) { 
						bus1 = Router.renderOneBusRouteDetail(pid1, stop, pid1Groups[i]);
						bus2 = Router.renderOneBusRouteDetail(stop, pid2, pid2Groups[j]);
						if(bus1.length > 0 && bus2.length > 0) {
							result.routes.push({	buses		: [bus1, bus2],
													changeovers	: [stop] }); 
						}
					});
				}
			}
		}			
		/*
		var commonBus = _.intersection(pid1Buses, pid2Buses);
		
		if(commonBus.length > 0) {
			console.log('Single bus routes found! Opts: ' + commonBus.length);
			_.forEach(commonBus, function(bid) { 
				result.routes.push(Router.renderOneBusRouteDetail(pid1, pid2, bid)); 
			});
		}
		else {
			var commonStops = [], _comStop = [];
			
			for(var i = 0; i < pid1Buses.length; i++) {
				for(var j = 0; j < pid2Buses.length; j++) {
					var pid1BusStops = _.pluck(Buses.routes[pid1Buses[i]].stops, 'pid');
					var pid2BusStops = _.pluck(Buses.routes[pid2Buses[j]].stops, 'pid');
					
					_comStop = _.intersection(pid1BusStops, pid2BusStops);
					
					if(_comStop.length > 0) {
						commonStops.push({bus1: pid1Buses[i], bus2: pid2Buses[j], ids: _.clone(_comStop) });
					}
				}
			}
			
			commonStops = _.uniq(commonStops);
			if(commonStops.length > 0) {
				console.log('Two bus routes found! Opts: ' + commonStops.length);
				_.forEach(commonStops, function(stop) { 
					result.routes.push(Router.renderRouteDetail(pid1, pid2, stop));
				});
			}
		}
		*/
		
		return result;
	},
	
	renderOneBusRouteDetail: function(pid1, pid2, groupid) {

		var routeid, routestops, pid1match, pid2match, routes = [];
		
		for(var i = 0; i < Buses.groups[groupid].routes.length; i++) {
			routeid = Buses.groups[groupid].routes[i];
			routestops = _.pluck(Buses.routes[routeid].stopsfrom, 'pid');
			if(_.contains(routestops, pid1) && _.contains(routestops, pid2)) {
				
				pid1match = _.find(Buses.routes[routeid].stopsfrom, { 'pid': pid1 });
				pid2match = _.find(Buses.routes[routeid].stopsfrom, { 'pid': pid2 });
				if(pid1match && pid2match && pid1match.dist <= pid2match.dist) {
					routes.push(Router.renderBusDetail(routeid));
				}
			}
			
			/** reverse journey of bus */
			routestops = _.pluck(Buses.routes[routeid].stopsto, 'pid');
			if(_.contains(routestops, pid1) && _.contains(routestops, pid2)) {
				pid1match = _.find(Buses.routes[routeid].stopsto, { 'pid': pid1 });
				pid2match = _.find(Buses.routes[routeid].stopsto, { 'pid': pid2 });
				if(pid1match && pid2match && pid1match.dist <= pid2match.dist) {
					/** tell render function that travel direction is reversed */
					routes.push(Router.renderBusDetail(routeid, true)); 
				}
			}	
		}	
		
		return routes;
		
					//verbose		: 'Take the ' + Router.renderBusDetail(busid, 'detailed') + ' at ' + Buses.places[pid1].name +
									//'. Get down at ' + Buses.places[pid2].name };
	},
	
	renderRouteDetail: function(pid1, pid2, stop) {
		var names = [], places = [];
		for(var i = 0; i < stop.ids.length; i++) {
			names.push(Buses.places[stop.ids[i]].name);
			places.push(Router.getPlaceDetail(stop.ids[i]));
		}
		
		return { 	buses		: [Router.renderBusDetail(stop.bus1, 'json'), Router.renderBusDetail(stop.bus2, 'json')],
					changeovers	: places,
					verbose		: 'Take the ' + Router.renderBusDetail(stop.bus1, 'detailed') + ' at ' + Buses.places[pid1].name +
									'. Get down at ' + names.join(' or ') +
									'. Take ' +  Router.renderBusDetail(stop.bus2, 'detailed') + ' to ' + Buses.places[pid2].name };
	},
	
	renderBusDetail: function(bid, reverse) {
		/* bus only travels this way when returning, not on original journey */
		if(reverse) {
			return { routeno: Buses.routes[bid].routeno, from: Buses.routes[bid].to, to: Buses.routes[bid].from };
		}
		else {
			return { routeno: Buses.routes[bid].routeno, from: Buses.routes[bid].from, to: Buses.routes[bid].to };
		}
	},
	
	getPlaceDetail: function(pid) {
		return { name: Buses.places[pid].name, lat: Buses.places[pid].lat, lng: Buses.places[pid].lon };
	}
};
