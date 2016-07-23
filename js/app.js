'use strict';

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Router from './router';

var router = new Router();

class LocateMeButton extends Component {
    constructor() {
        super();
        this.geolocate = this.geolocate.bind(this);
    }

    /** geolocate code from MDN: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/Using_geolocation */
    geolocate() {
        var _props = this.props;
        if (!navigator.geolocation) {
            _props.setError('Sorry! Your browser does not support Geolocation.');
            return;
        }

        navigator.geolocation.getCurrentPosition(function(position) {
            _props.setUserLoc(position.coords.latitude, position.coords.longitude); /** on success */
        }, function() {
            _props.setError('Sorry! There was an error in getting your location.'); /** on error */
        });
    }

    render() {
        return (
            <button onClick={this.geolocate} className="btn btn-default" type="button">
                <span className="glyphicon glyphicon-map-marker"></span> Locate Me!
            </button>
        );
    }
}

class SourceInput extends Component {
    render() {
        return (
            <div className="input-group input-group-lg">
                <input id="source" type="text" className="form-control" placeholder="I'm at..." 
                    value={this.props.appState.source.name} onChange={this.props.sourceInput}/>
                <span className="input-group-btn">
                    <LocateMeButton {...this.props}/>
                </span>
            </div>
        );
    }
}

class DestinationInput extends Component {
    render() {
        return (
            <div className="input-group input-group-lg">
                <input id="destination" type="text" className="form-control" placeholder="I want to go to..." 
                    value={this.props.appState.destination.name} onChange={this.props.destinationInput}/>
                <span className="input-group-btn">
                    <button onClick={this.props.findRoutes} className="btn btn-default btn-success" type="button">
                        Find Me A Bus!
                    </button>
                </span>
            </div>
        );
    }
}

class UserInput extends Component {
    render() {
        return (
            <div className="jumbotron text-center">
                <p className="lead">Enter where you are and where you want to go below:</p>
                <div className="row">
                    <div className="col-xs-12 col-sm-6">
                        <SourceInput {...this.props}/>
                    </div>

                    <div className="visible-xs col-xs-12 text-center"><br/></div>

                    <div className="col-xs-12 col-sm-6">
                        <DestinationInput {...this.props}/>
                    </div>
                </div>
            </div>
        );
    }
}

class App extends Component {
    constructor() {
        super();
        this.state = {
            userLat: null,
            userLon: null,

            source: { id: null, name: '' },
            sourceSug: [],

            destination: { id: null, name: '' },
            destinationSug: [],

            error: null,
            warning: null
        };
        this.setUserLoc         = this.setUserLoc.bind(this);
        this.setError           = this.setError.bind(this);
        this.findRoutes         = this.findRoutes.bind(this);
        this.sourceInput        = this.sourceInput.bind(this);
        this.destinationInput   = this.destinationInput.bind(this);
    }

    setError(error) {
        this.setState({error});
    }

    setUserLoc(userLat, userLon) {
        this.setState({userLat, userLon});

        var nearest = router.getNearestPlace(userLat, userLon);
        if(nearest) {
            this.setState({
                source: { id: nearest.id, name: nearest.name }
            });

            if(nearest.distance > 1000) {
                this.setState({
                    warning: 'You might have to walk ' + (nearest.distance / 1000.0).toFixed(2) + 'km'
                });
            }
        }
    }

    sourceInput(event) {
        this.setState({ source: { id: null, name: event.target.value }});
    }

    destinationInput(event) {
        this.setState({ destination: { id: null, name: event.target.value }});
    }

    findRoutes() {
        this.setError('Find Routes');
    }

    render() {
        return (
            <div>
                <UserInput 
                    appState={this.state} 
                    setUserLoc={this.setUserLoc} 
                    setError={this.setError}
                    sourceInput={this.sourceInput}
                    destinationInput={this.destinationInput}
                    findRoutes={this.findRoutes} />
                <p>This is where things go down {Math.random()}</p>
                <p>{this.state.error}</p>
                <p>{this.state.warning}</p>
                <p>Lat: {this.state.userLat}</p>
                <p>Lon: {this.state.userLon}</p>
            </div>
        );
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('app')
);

// var map, source, destination, router = new Router();

// function findRoutes(from, to) {
//     var buses = router.findRoutes(from, to);

//     if(buses) {
//         document.getElementById('output').innerHTML = buses.map(function(b, index) {
//             return renderOption(b, index);
//         }).join('\n');
//     }
//     else {
//         document.getElementById('output').innerHTML = '<div class="panel panel-danger">' +
//         '<div class="panel-heading"><h3 class="panel-title">No Buses</h3></div>' +
//         '<div class="panel-body"><p>Sorry, no buses were found</p></div></div>';
//     }
// }

// /** load locations into hash */
// function loadHash() {
//     if(source && destination) {
//         location.hash = source + '-' + destination;
//     }
// }

// /** see if locations are stored in the hash */
// function handleHashchange() {
//     if(location.hash.length > 1) {
//         var hash    = location.hash.substr(1).split('-');
//         var from    = router.getPlaceDetails(hash[0]);
//         var to      = router.getPlaceDetails(hash[1]);
//         if(from && to) {
//             $('#source').val(from.name);
//             $('#destination').val(to.name);

//             source      = hash[0];
//             destination = hash[1];

//             findRoutes(hash[0], hash[1]);
//         }
//     }
// }

// window.onhashchange = handleHashchange;

// function renderOption(route, index) {
//     var output;
//     if(route.changes.length == 0) {
//         output = '<div class="col-xs-12">' + 
//             renderRoute(route.from, route.to, route.distance, route.routes[0].routes) + '</div>';
//     }
//     else if(route.changes.length == 1) {
//         output = '<div class="col-xs-6">' + 
//             renderRoute(route.from, route.changes[0], route.routes[0].distance, route.routes[0].routes) + 
//         '</div><div class="col-xs-6">' +
//             renderRoute(route.changes[0], route.to, route.routes[1].distance, route.routes[1].routes) + 
//         '</div>';
//     }
//     else if(route.changes.length == 2) {
//         output = '<div class="col-xs-4">' + 
//             renderRoute(route.from, route.changes[0], route.routes[0].distance, route.routes[0].routes) + 
//         '</div><div class="col-xs-4">' +
//             renderRoute(route.changes[0], route.changes[1], route.routes[1].distance, route.routes[1].routes) +
//         '</div><div class="col-xs-4">' +
//             renderRoute(route.changes[1], route.to, route.routes[2].distance, route.routes[2].routes) + 
//         '</div>';
//     }

//     if(index == 0) {
//         output = '<div class="panel panel-warning"><div class="panel-heading"><h3 class="panel-title">' + 
//         '<span class="glyphicon glyphicon-star"></span> Recommended Route</h3></div><div class="panel-body row">' + 
//         output;
//     }
//     else {
//         output = '<div class="panel panel-default"><div class="panel-body row">' + output;
//     }

//     return output + '</div><div class="panel-footer text-center">Total Distance: <strong>' + 
//         (route.distance / 1000.0).toFixed(2) + 'km </strong></div></div>';
// }

// function renderRoute(from, to, distance, buses) {
//     var from    = router.getPlaceDetails(from);
//     var to      = router.getPlaceDetails(to);

//     var details;
//     var busmarkup = buses.map(function(r) {
//         details = router.getRouteDetails(r);
//         if(details) {
//             return '<a class="list-group-item"><strong>#' + details.routeno +
//                     '</strong> (' + details.from + ' - ' + details.to + ')</a>';
//         }
//     }).join('\n');

//     return '<div class="panel panel-primary">' + 
//         '<div class="panel-heading"><h3 class="panel-title">' + 
//         '<a href="#" data-lat="' + from.lat + '" data-lon="' + from.lon + '" data-toggle="modal" data-target="#map-modal">' + 
//         from.name + '</a> to <a href="#" data-lat="' + to.lat + '" data-lon="' + to.lon + '" data-toggle="modal" data-target="#map-modal">' + 
//         to.name + '</a> (' + (distance / 1000.0).toFixed(2) + 'km)</h3></div>' + 
//         '<div class="list-group">' + busmarkup + '</div></div>';
// }

// /** geolocate code from MDN: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/Using_geolocation */
// function geolocate() {
//     if (!navigator.geolocation) {
//         $('#walk-warning').text('Sorry! Your browser does not support Geolocation.').removeClass('hide');
//         return;
//     }

//     navigator.geolocation.getCurrentPosition(function(position) {
//         /** on success */
//         var nearest = router.getNearestPlace(position.coords.latitude, position.coords.longitude);
//         if(nearest) {
//             $('#source').val(nearest.name);
//             source = nearest.id;
            
//             if(nearest.distance < 1000) {
//                 $('#walk-warning').addClass('hide');
//             }
//             else {
//                 $('#walk-warning').text('You might have to walk ' + 
//                     (nearest.distance / 1000.0).toFixed(2) + 'km').removeClass('hide');
//             }
//         }
//         else {
//             $('#walk-warning').text('Sorry! No bus stops found nearby.').removeClass('hide');
//         }
//     }, function() {
//         /** on error */
//         $('#walk-warning').text('Sorry! There was an error in getting your location.').removeClass('hide');
//     });
// }

// /** load autocomplete on document.ready, and handle hash if present */
// $(function() {
//     handleHashchange();

//     $('#source').autocomplete({
//         lookup: router.getAllPlaces(),
//         onSelect: function (suggestion) {
//             source = suggestion.data;
//             loadHash();
//         }
//     });

//     $('#destination').autocomplete({
//         lookup: router.getAllPlaces(),
//         onSelect: function (suggestion) {
//             destination = suggestion.data;
//             loadHash();
//         }
//     });
// });

// /** Google Map code stolen off http://stackoverflow.com/a/26410438 */
// function initMap(myCenter) {
//     var marker = new google.maps.Marker({
//         position: myCenter
//     });

//     var mapProp = {
//         center: myCenter,
//         zoom: 16,
//         mapTypeId: google.maps.MapTypeId.ROADMAP
//     };

//     map = new google.maps.Map(document.getElementById('map-canvas'), mapProp);
//     marker.setMap(map);
// };

// $('#map-modal').on('shown.bs.modal', function(e) {
//     var element = $(e.relatedTarget);
//     initMap(new google.maps.LatLng(element.data('lat'), element.data('lon')));
//     $('#map-title').html(element.html());
// });

