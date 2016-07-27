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
        this.readHash       = this.readHash.bind(this);
        this.setHash        = this.setHash.bind(this);

        this.filterSuggestions  = this.filterSuggestions.bind(this);

        setTimeout(this.readHash, 500);
    }

    readHash() {
        if(window.location.hash.length > 1) {
            var hash = window.location.hash.substr(1).split('-');
            if(hash.length == 2) {
                var from    = router.getPlaceDetails(hash[0]);
                var to      = router.getPlaceDetails(hash[1]);
                if(from && to) {
                    this.setSource(hash[0], from.name);
                    this.setDestination(hash[1], to.name);
                    setTimeout(this.findRoutes, 500);
                }
            }
        }
    }

    setHash() {
        if(this.state.source.id && this.state.destination.id) {
            window.location.hash = '#' + this.state.source.id + '-' + this.state.destination.id;
        }
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
        if(id) { setTimeout(this.setHash, 500); }
    }

    setDestination(id, name) {
        this.setState({ 
            destination: { id: id, name: name },
            destinationSug: id ? [] : this.filterSuggestions(name)
        });
        if(id) { setTimeout(this.setHash, 500); }
    }

    filterSuggestions(term) {
        if(term.length > 0) {
            var regexp = new RegExp(term, 'i');
            return this.state.locations.filter(function(elem) { return regexp.test(elem.name); }).slice(0,4);
        }
        return [];
    }

    findRoutes() {
        this.setState({ routes: [] });
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
                    this.setError("Sorry! No buses were found.");
                }
            }
        }
        else {
            this.setError("You haven't entered where you are and/or where you want to go!");
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

