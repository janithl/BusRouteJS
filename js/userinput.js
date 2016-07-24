'use strict';

import React, { Component } from 'react';

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

class Suggestion extends Component {
    constructor() {
        super();
        this.setSuggestion = this.setSuggestion.bind(this);
    }

    setSuggestion() {
        this.props.setSuggestion(this.props.suggestion.id, this.props.suggestion.name);
    }

    render() {
        return <a className="list-group-item" onClick={this.setSuggestion} key={this.props.suggestion.id}>{this.props.suggestion.name}</a>;
    }
}

class SuggestionsList extends Component {
    render() {
        if(this.props.suggestions.length == 0) {
            return <div/>
        }
        else {
            var _props = this.props;
            return (
                <div className="list-group text-left">
                    {this.props.suggestions.map(function(sug, index) {
                        return <Suggestion key={index} suggestion={sug} setSuggestion={_props.setSuggestion}/>;
                    })}
                </div>
            );
        }
    }
}

class SourceInput extends Component {
    constructor() {
        super();
        this.handleInput = this.handleInput.bind(this);
    }

    handleInput(event) {
        this.props.setSource(null, event.target.value);
    }

    render() {
        return (
            <div className="input-group input-group-lg">
                <input id="source" type="text" className="form-control" placeholder="I'm at..." 
                    value={this.props.appState.source.name} onChange={this.handleInput}/>
                <span className="input-group-btn">
                    <LocateMeButton {...this.props}/>
                </span>
            </div>
        );
    }
}

class DestinationInput extends Component {
    constructor() {
        super();
        this.handleInput = this.handleInput.bind(this);
    }

    handleInput(event) {
        this.props.setDestination(null, event.target.value);
    }

    render() {
        return (
            <div className="input-group input-group-lg">
                <input id="destination" type="text" className="form-control" placeholder="I want to go to..." 
                    value={this.props.appState.destination.name} onChange={this.handleInput}/>
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
                        <SuggestionsList suggestions={this.props.appState.sourceSug} setSuggestion={this.props.setSource}/>
                    </div>

                    <div className="visible-xs col-xs-12 text-center"><br/></div>

                    <div className="col-xs-12 col-sm-6">
                        <DestinationInput {...this.props}/>
                        <SuggestionsList suggestions={this.props.appState.destinationSug} setSuggestion={this.props.setDestination}/>
                    </div>
                </div>
            </div>
        );
    }
}

export default UserInput;