'use strict';

import React, { Component } from 'react';

class RenderRoute extends Component {
    render() {
        var from    = this.props.router.getPlaceDetails(this.props.route.from);
        var to      = this.props.router.getPlaceDetails(this.props.route.to);

        var details, busmarkup = this.props.route.routes.map(function(r) {
            details = this.props.router.getRouteDetails(r);
            if(details) {
                return <a className="list-group-item"><strong>#{details.routeno}</strong> ({details.from} - {details.to})</a>
            }
        }.bind(this));

        if(from && to) {
            return (
                <div className="panel panel-primary">
                    <div className="panel-heading">
                    <h3 className="panel-title">
                        <a data-lat={from.lat} data-lon={from.lon} data-toggle="modal" 
                        data-target="#map-modal">{from.name}</a> to <a data-lat={to.lat} data-lon={to.lon} 
                        data-toggle="modal" data-target="#map-modal">{to.name}</a> ({(this.props.route.distance / 1000.0).toFixed(2)} km)
                    </h3>
                    </div>
                    <div class="list-group">{busmarkup}</div>
                </div>
            );
        }
        else {
            return <div/>;
        }
    }
}

class RenderOption extends Component {
    render() {
        var cssclass = this.props.first ? 'panel panel-warning' : 'panel panel-default';
        var recommended = <div/>;
        if(this.props.first) {
            recommended = <div className="panel-heading">
                <h3 className="panel-title">
                    <span class="glyphicon glyphicon-star"></span> Recommended Route
                </h3>
            </div>;
        }
        return (
            <div className={cssclass}>
                {recommended}
                <div className="panel-body row">
                    {this.props.route.routes.map(function(r, index) {
                        return <RenderRoute key={index} route={r} router={this.props.router}/>
                    }.bind(this))}
                </div>
                <div className="panel-footer text-center">
                    Total Distance: <strong>{(this.props.route.distance / 1000.0).toFixed(2)} km </strong>
                </div>
            </div>
        );
    }
}

class DisplayRoutes extends Component {
    render() {
        var routes = <div/>;
        if(this.props.routes && this.props.routes.length > 0) {
            routes = this.props.routes.map(function(r, index) {
                return <RenderOption key={index} first={index===0} route={r} router={this.props.router}/>
            }.bind(this));
        }
        return (
            <div>{routes}</div>
        );
    }
}

export default DisplayRoutes;