var Display = {
	getBuses: function(e) {
		var splace = parseInt(document.getElementById('splace').value.replace(/\s/g, ''));
		var dplace = parseInt(document.getElementById('dplace').value.replace(/\s/g, ''));
		
		if(splace != '' && dplace != '') {
			var output = '', routes = Router.findRoutes(splace, dplace);
			output += '<li class="table-view-divider">Start</li><li class="table-view-cell">' +
			'<a class="navigate-right">' + routes.from.name + '</a></li>' + 
			'<li class="table-view-divider">Buses</li>';
			
			for(var i = 0; i < Math.min(5, routes.routes.length); i++) {
				output += '<li class="table-view-cell"><a class="navigate-right">' +
				'<span class="badge">' + (routes.routes[i].dist/1000).toFixed(2) + ' km</span><ul>' + 
				Display.renderVerboseDetail(routes.routes[i], splace, dplace) + '</ul></a></li>';
			}
			
			output += '<li class="table-view-divider">End</li><li class="table-view-cell">' +
			'<a class="navigate-right">' + routes.to.name + '</a></li>';
			
			document.getElementById('routes').innerHTML = output;
		}
		else {
			console.log('nei');
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
