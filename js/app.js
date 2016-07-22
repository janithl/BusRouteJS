var map, source, destination, router = new Router();

function findRoutes() {
    var hash  = location.hash.substr(1).split('-');
    var buses = router.findRoutes(hash[0], hash[1]);

    document.getElementById('output').innerHTML = buses.map(function(b, index) {
        return renderOption(b, index);
    }).join('\n');
}

/** load locations into hash */
function loadHash() {
    if(source && destination) {
        location.hash = source + '-' + destination;
    }
}

/** see if locations are stored in the hash */
function handleHashchange() {
    if(location.hash.length > 1) {
        findRoutes();
    }
}

window.onhashchange = handleHashchange;

function renderOption(route, index) {
    var output;
    if(route.changes.length == 0) {
        output = '<div class="col-xs-12">' + 
            renderRoute(route.from, route.to, route.distance, route.routes[0].routes) + '</div>';
    }
    else if(route.changes.length == 1) {
        output = '<div class="col-xs-6">' + 
            renderRoute(route.from, route.changes[0], route.routes[0].distance, route.routes[0].routes) + 
        '</div><div class="col-xs-6">' +
            renderRoute(route.changes[0], route.to, route.routes[1].distance, route.routes[1].routes) + 
        '</div>';
    }
    else if(route.changes.length == 2) {
        output = '<div class="col-xs-4">' + 
            renderRoute(route.from, route.changes[0], route.routes[0].distance, route.routes[0].routes) + 
        '</div><div class="col-xs-4">' +
            renderRoute(route.changes[0], route.changes[1], route.routes[1].distance, route.routes[1].routes) +
        '</div><div class="col-xs-4">' +
            renderRoute(route.changes[1], route.to, route.routes[2].distance, route.routes[2].routes) + 
        '</div>';
    }

    if(index == 0) {
        output = '<div class="panel panel-warning"><div class="panel-heading"><h3 class="panel-title">' + 
        '<span class="glyphicon glyphicon-star"></span> Recommended Route</h3></div><div class="panel-body row">' + 
        output;
    }
    else {
        output = '<div class="panel panel-default"><div class="panel-body row">' + output;
    }

    return output + '</div><div class="panel-footer text-center">Total Distance: <strong>' + 
        (route.distance / 1000.0).toFixed(2) + 'km </strong></div></div>';
}

function renderRoute(from, to, distance, buses) {
    var from    = router.getPlaceDetails(from);
    var to      = router.getPlaceDetails(to);

    var details;
    var busmarkup = buses.map(function(r) {
        details = router.getRouteDetails(r);
        if(details) {
            return '<a class="list-group-item"><strong>#' + details.routeno +
                    '</strong> (' + details.from + ' - ' + details.to + ')</a>';
        }
    }).join('\n');

    return '<div class="panel panel-primary">' + 
        '<div class="panel-heading"><h3 class="panel-title">' + 
        '<a href="#" data-lat="' + from.lat + '" data-lon="' + from.lon + '" data-toggle="modal" data-target="#map-modal">' + 
        from.name + '</a> to <a href="#" data-lat="' + to.lat + '" data-lon="' + to.lon + '" data-toggle="modal" data-target="#map-modal">' + 
        to.name + '</a> (' + (distance / 1000.0).toFixed(2) + 'km)</h3></div>' + 
        '<div class="list-group">' + busmarkup + '</div></div>';
}

/** geolocate code from MDN: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/Using_geolocation */
function geolocate() {
    if (!navigator.geolocation) {
        $('#walk-warning').text('Sorry! Your browser does not support Geolocation.').removeClass('hide');
        return;
    }

    navigator.geolocation.getCurrentPosition(function(position) {
        /** on success */
        var nearest = router.getNearestPlace(position.coords.latitude, position.coords.longitude);
        if(nearest) {
            $('source').val(nearest.name);
            source = nearest.id;
            
            if(nearest.distance < 1000) {
                $('#walk-warning').addClass('hide');
            }
            else {
                $('#walk-warning').text('You might have to walk ' + 
                    (nearest.distance / 1000.0).toFixed(2) + 'km').removeClass('hide');
            }
        }
        else {
            $('#walk-warning').text('Sorry! No bus stops found nearby.').removeClass('hide');
        }
    }, function() {
        /** on error */
        $('#walk-warning').text('Sorry! There was an error in getting your location.').removeClass('hide');
    });
}

/** load autocomplete on document.ready, and handle hash if present */
$(function() {

    handleHashchange();

    $('#source').autocomplete({
        lookup: router.getAllPlaces(),
        onSelect: function (suggestion) {
            source = suggestion.data;
        }
    });

    $('#destination').autocomplete({
        lookup: router.getAllPlaces(),
        onSelect: function (suggestion) {
            destination = suggestion.data;
        }
    });
});

/** Google Map code stolen off http://stackoverflow.com/a/26410438 */
function initMap(myCenter) {
    var marker = new google.maps.Marker({
        position: myCenter
    });

    var mapProp = {
        center: myCenter,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById('map-canvas'), mapProp);
    marker.setMap(map);
};

$('#map-modal').on('shown.bs.modal', function(e) {
    var element = $(e.relatedTarget);
    initMap(new google.maps.LatLng(element.data('lat'), element.data('lon')));
    $('#map-title').html(element.html());
});