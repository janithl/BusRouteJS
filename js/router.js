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
							
		var commonGroup = _.intersection(pid1Groups, pid2Groups), bus;
		if(commonGroup.length > 0) {
			console.log('Single bus group found! Opts: ' + commonGroup.length);
			_.forEach(commonGroup, function(groupid) {
				bus = Router.renderRouteDetail(pid1, pid2, groupid); 
				result.routes.push({	buses		: [bus],
										dist		: _.max(_.pluck(bus, 'dist')),
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
						bus1 = Router.renderRouteDetail(pid1, stop, pid1Groups[i]);
						bus2 = Router.renderRouteDetail(stop, pid2, pid2Groups[j]);
						if(bus1.length > 0 && bus2.length > 0) {
							result.routes.push({	buses		: [bus1, bus2],
													dist		: _.max(_.pluck(bus1, 'dist')) + _.max(_.pluck(bus2, 'dist')),
													changeovers	: [Router.getPlaceDetail(stop)] }); 
						}
					});
				}
			}
			
			if(result.routes.length < 2) {
			
				/** and three bus */
				var commonStops1 = [], commonStops2 = [];
				for(var key in Buses.groups) {
					for(var i = 0; i < pid1Groups.length; i++) {
						for(var j = 0; j < pid2Groups.length; j++) {
							if(pid1Groups[i] != pid2Groups[j] && Buses.groups[key] != pid1Groups[i]) {
								commonStops1 = _.intersection(Buses.groups[pid1Groups[i]].stops, Buses.groups[key].stops);
								commonStops2 = _.intersection(Buses.groups[pid2Groups[j]].stops, Buses.groups[key].stops);
								for(var k = 0; k < commonStops1.length; k++) {
									for(var l = 0; l < commonStops2.length; l++) {
										bus1 = Router.renderRouteDetail(pid1, 				commonStops1[k], 	pid1Groups[i]);
										bus2 = Router.renderRouteDetail(commonStops1[k], 	commonStops2[l], 	key);
										bus3 = Router.renderRouteDetail(commonStops2[l], 	pid2, 				pid2Groups[j]);
										if(bus1.length > 0 && bus2.length > 0 && bus3.length > 0 && commonStops1[k] != commonStops2[l]) {
											result.routes.push({	buses		: [bus1, bus2, bus3],
																	dist		: _.max(_.pluck(bus1, 'dist')) + _.max(_.pluck(bus2, 'dist'))  + _.max(_.pluck(bus3, 'dist')),
																	changeovers	: [Router.getPlaceDetail(commonStops1[k]), Router.getPlaceDetail(commonStops2[l])] }); 
										}
									}
								}
							}
						}
					}
				}
			}
		}
		
		result.routes = _.sortBy(result.routes, function(r) { return r.dist; }).splice(0, 30);
		return result;
	},
	
	renderRouteDetail: function(pid1, pid2, groupid) {

		var routeid, routestops, pid1match, pid2match, routes = [];
		
		for(var i = 0; i < Buses.groups[groupid].routes.length; i++) {
			routeid = Buses.groups[groupid].routes[i];
			routestops = _.pluck(Buses.routes[routeid].stopsfrom, 'pid');
			if(_.contains(routestops, pid1) && _.contains(routestops, pid2)) {
				
				pid1match = _.find(Buses.routes[routeid].stopsfrom, { 'pid': pid1 });
				pid2match = _.find(Buses.routes[routeid].stopsfrom, { 'pid': pid2 });
				if(pid1match && pid2match && pid1match.dist <= pid2match.dist) {
					routes.push(Router.renderBusDetail(routeid, (pid2match.dist - pid1match.dist)));
				}
			}
			
			/** reverse journey of bus */
			routestops = _.pluck(Buses.routes[routeid].stopsto, 'pid');
			if(_.contains(routestops, pid1) && _.contains(routestops, pid2)) {
				pid1match = _.find(Buses.routes[routeid].stopsto, { 'pid': pid1 });
				pid2match = _.find(Buses.routes[routeid].stopsto, { 'pid': pid2 });
				if(pid1match && pid2match && pid1match.dist <= pid2match.dist) {
					/** tell render function that travel direction is reversed */
					routes.push(Router.renderBusDetail(routeid, (pid2match.dist - pid1match.dist), true)); 
				}
			}	
		}	
		
		return routes;
	},
	
	renderBusDetail: function(bid, distance, reverse) {
		/* bus only travels this way when returning, not on original journey */
		if(reverse) {
			return { routeno: Buses.routes[bid].routeno, from: Buses.routes[bid].to, to: Buses.routes[bid].from, dist: distance };
		}
		else {
			return { routeno: Buses.routes[bid].routeno, from: Buses.routes[bid].from, to: Buses.routes[bid].to, dist: distance };
		}
	},
	
	getPlaceDetail: function(pid) {
		return { name: Buses.places[pid].name, lat: Buses.places[pid].lat, lng: Buses.places[pid].lon };
	}
};
