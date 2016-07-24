'use strict';

import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import Router from './router';
import UserInput from './userinput';
import DisplayRoutes from './displayroutes';

var router = new Router();

class DisplayAlert extends Component {
    render() {
        if(this.props.message) {
            var cssclass = 'alert alert-dismissible alert-' + this.props.cssclass;
            return (
                <div className={cssclass}>
                    <button type="button" className="close" data-dismiss="alert">&times;</button>
                    <h4>{this.props.title}</h4>
                    <p>{this.props.message}</p>
                </div>
            );
        }
        else {
            return <div/>;
        }
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

            locations: router.getAllPlaces(),
            routes: [],

            error: null,
            warning: null
        };

        this.setUserLoc     = this.setUserLoc.bind(this);
        this.setError       = this.setError.bind(this);
        this.findRoutes     = this.findRoutes.bind(this);

        this.setSource      = this.setSource.bind(this);
        this.setDestination = this.setDestination.bind(this);

        this.filterSuggestions  = this.filterSuggestions.bind(this);
    }

    setError(error) {
        this.setState({error});
    }

    setUserLoc(userLat, userLon) {
        this.setState({userLat, userLon});

        var nearest = router.getNearestPlace(userLat, userLon);
        if(nearest) {
            this.setSource(nearest.id, nearest.name);

            if(nearest.distance > 1000) {
                this.setState({
                    warning: 'You might have to walk ' + (nearest.distance / 1000.0).toFixed(2) + 'km'
                });
            }
        }
    }

    setSource(id, name) {
        this.setState({ 
            source: { id: id, name: name },
            sourceSug: id ? [] : this.filterSuggestions(name)
        });
    }

    setDestination(id, name) {
        this.setState({ 
            destination: { id: id, name: name },
            destinationSug: id ? [] : this.filterSuggestions(name)
        });
    }

    filterSuggestions(term) {
        if(term.length > 0) {
            var regexp = new RegExp(term, 'i');
            return this.state.locations.filter(function(elem) { return regexp.test(elem.name); }).slice(0,4);
        }
        return [];
    }

    findRoutes() {
        if(this.state.source.id && this.state.destination.id) {
            if(this.state.source.id === this.state.destination.id) {
                this.setError("Source and destination same");
            }
            else {
                var routes = router.findRoutes(this.state.source.id, this.state.destination.id);
                if(routes && routes.length > 0) {
                    this.setState({ routes: routes, error: null });
                }
                else {
                    this.setState({ routes: [], error: "Sorry! No buses were found." });
                }
            }
        }
        else {
            this.setState({ routes: [],  error: "You haven't entered where you are and/or where you want to go!" });
        }
    }

    render() {
        return (
            <div>
                <UserInput 
                    appState={this.state} 
                    setUserLoc={this.setUserLoc} 
                    setError={this.setError}
                    setSource={this.setSource}
                    setDestination={this.setDestination}
                    findRoutes={this.findRoutes} />

                <DisplayAlert cssclass="danger" title="Error!" message={this.state.error}/>
                <DisplayAlert cssclass="warning" title="Warning!" message={this.state.warning}/>

                <DisplayRoutes routes={this.state.routes} router={router}/>
            </div>
        );
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('app')
);

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

    var map = new google.maps.Map(document.getElementById('map-canvas'), mapProp);
    marker.setMap(map);
};

$('#map-modal').on('shown.bs.modal', function(e) {
    var element = $(e.relatedTarget);
    initMap(new google.maps.LatLng(element.data('lat'), element.data('lon')));
    $('#map-title').html(element.html());
});

