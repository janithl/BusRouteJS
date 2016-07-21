var router = new Router();

function findRoutes() {
    var buses = router.findRoutes(document.getElementById('source').value, document.getElementById('destination').value);


    document.getElementById('output').innerHTML = buses.map(function(b) {
        return renderRoute(b);
    }).join('\n');
}

function renderRoute(route) {
    var from    = router.getPlaceDetails(route.from);
    var to      = router.getPlaceDetails(route.to);

    var details;
    var buses   = route.routes.map(function(r) {
        return r.routes.map(function(rr) {
            details = router.getRouteDetails(rr);
            if(details) {
                return '<a href="#" class="list-group-item">Route #' + details.routeno +
                        ' (' + details.from + ' - ' + details.to + ')</a>';
            }
        }).join('\n');
    }).join('\n');

    return '<div class="panel panel-primary">' + 
        '<div class="panel-heading"><h3 class="panel-title">' + 
            from.name + ' to ' + to.name + ' (' + route.distance + 'm)' +
        '</h3></div>' + 
        '<div class="panel-body"><div class="list-group">' + buses + '</div></div></div>';
}