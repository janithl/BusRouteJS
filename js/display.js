var Display = {
	getBuses: function(e) {
		var splace = document.getElementById('splace').value.replace(/\s/g, '');
		var dplace = document.getElementById('dplace').value.replace(/\s/g, '');
		
		splace = isNaN(splace) ? parseInt(Router.getPlaceId(splace)) : parseInt(splace);
		dplace = isNaN(dplace) ? parseInt(Router.getPlaceId(dplace)) : parseInt(dplace);
		
		if(splace != '' && dplace != '' && !isNaN(splace) && !isNaN(dplace)) {
			var output = '', routes = Router.findRoutes(splace, dplace);
			output += '<li class="table-view-divider">Start</li><li class="table-view-cell">' +
			'<a href="#start-modal" class="navigate-right">' + routes.from.name + '</a></li>' + 
			'<li class="table-view-divider">Buses</li>';
			
			for(var i = 0; i < Math.min(5, routes.routes.length); i++) {
				output += '<li class="table-view-cell"><a class="navigate-right"><ul>' + 
				Display.renderVerboseDetail(routes.routes[i], splace, dplace) + '</ul></a></li>';
			}
			
			if(routes.routes.length > 5) {
				output += '<li class="table-view-cell media"><a class="navigate-right">' +
				'<span class="media-object pull-left icon icon-more"></span>' +
				'<div class="media-body">' + (routes.routes.length - 1) + ' More Buses</div></a></li>';
			}
			
			output += '<li class="table-view-divider">End</li><li class="table-view-cell">' +
			'<a href="#destination-modal" class="navigate-right">' + routes.to.name + '</a></li>';
			
			document.getElementById('routes').innerHTML = output;
			
			document.getElementById('start-modal-title').innerHTML = routes.from.name;
			document.getElementById('start-modal-content').innerHTML =
			'<img src="http://maps.googleapis.com/maps/api/staticmap?center=' + routes.from.lat + ',' + routes.from.lng + 
			'&zoom=15&size=' + window.innerWidth + 'x' + window.innerWidth + '&maptype=roadmap' + 
			'&markers=color:red%7Clabel:S%7C' + routes.from.lat + ',' + routes.from.lng + '&sensor=false">';
			
			document.getElementById('destination-modal-title').innerHTML = routes.to.name;
			document.getElementById('destination-modal-content').innerHTML =
			'<img src="http://maps.googleapis.com/maps/api/staticmap?center=' + routes.to.lat + ',' + routes.to.lng + 
			'&zoom=15&size=' + window.innerWidth + 'x' + window.innerWidth + '&maptype=roadmap' + 
			'&markers=color:red%7Clabel:S%7C' + routes.to.lat + ',' + routes.to.lng + '&sensor=false">';
		}
		else {
			document.getElementById('routes').innerHTML = '<li class="table-view-cell media">' +
			'<span class="media-object pull-left icon icon-close"></span> <div class="media-body">Error in Input</div></li>';
		}
		
		return false;
	},
	
	renderVerboseDetail: function(route, pid1, pid2) {
		var out = '<li>Take the <strong>' + route.buses[0][0].routeno + '</strong> (' + route.buses[0][0].from + 
		' - ' + route.buses[0][0].to +  ') ';
		switch(route.buses.length) {
			case 1:
				out += '</li>';
				break;
			case 2:
				out += 'to ' + route.changeovers[0].name + '.</li>' +
				'<li>Take the <strong>' + route.buses[1][0].routeno + '</strong> (' + route.buses[1][0].from + 
				' - ' + route.buses[1][0].to + ')</li>';
				break;
			case 3:
				out += 'to ' + route.changeovers[0].name + '.</li>' +
				'<li>Take the <strong>' + route.buses[1][0].routeno + '</strong> (' + route.buses[1][0].from + 
				' - ' + route.buses[1][0].to + ') to ' + route.changeovers[1].name + '.</li>' +
				'<li>Take the <strong>' + route.buses[2][0].routeno + '</strong> (' + route.buses[2][0].from + 
				' - ' + route.buses[2][0].to + ').</li>';
			default:
				break;		
		}
		
		return out;
	}
};
