'use strict';

import React, { Component } from 'react';

class MapLink extends Component {
    constructor() {
        super();
        this.renderMap = this.renderMap.bind(this);
    }

    renderMap() {
        $('#map-canvas').html(null);
        $('#map-title').html(this.props.link.name);

        setTimeout(function() {
            /** Google Map code stolen off http://stackoverflow.com/a/26410438 */
            var centre = new google.maps.LatLng(this.props.link.lat, this.props.link.lon);
            var marker = new google.maps.Marker({
                position: centre
            });

            var mapProp = {
                center: centre,
                zoom: 16,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            var map = new google.maps.Map(document.getElementById('map-canvas'), mapProp);
            marker.setMap(map);
        }.bind(this), 200);
    }

    render() {
        return(
            <a onClick={this.renderMap} data-toggle="modal" data-target="#map-modal">{this.props.link.name}</a>
        );
    }
}

class RenderRoute extends Component {
    render() {
        var from    = this.props.router.getPlaceDetails(this.props.from);
        var to      = this.props.router.getPlaceDetails(this.props.to);

        var details, busmarkup = this.props.route.routes.map(function(r, index) {
            details = this.props.router.getRouteDetails(r);
            if(details) {
                return <a key={index} className="list-group-item"><strong>#{details.routeno}</strong> ({details.from} - {details.to})</a>
            }
        }.bind(this));

        if(from && to) {
            return (
                <div className="panel panel-primary">
                    <div className="panel-heading">
                    <h3 className="panel-title">
                        <MapLink link={from}/> to <MapLink link={to}/> ({(this.props.route.distance / 1000.0).toFixed(2)} km)
                    </h3>
                    </div>
                    <div className="list-group">{busmarkup}</div>
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
                    <span className="glyphicon glyphicon-star"></span> Recommended Route
                </h3>
            </div>;
        }

        var components = <div className="panel-body row"/>;
        if(this.props.route.changes.length == 0) {
            components = <div className="panel-body row">
                <div className="col-xs-12">
                    <RenderRoute 
                        route={this.props.route.routes[0]} 
                        from={this.props.route.from} 
                        to={this.props.route.to} 
                        router={this.props.router}/>
                </div>
            </div>;
        }
        else if(this.props.route.changes.length == 1) {
            components = <div className="panel-body row">
                <div className="col-xs-6">
                    <RenderRoute 
                        route={this.props.route.routes[0]} 
                        from={this.props.route.from} 
                        to={this.props.route.changes[0]} 
                        router={this.props.router}/>
                </div>
                <div className="col-xs-6">
                    <RenderRoute 
                        route={this.props.route.routes[1]} 
                        from={this.props.route.changes[0]} 
                        to={this.props.route.to} 
                        router={this.props.router}/>
                </div>
            </div>;
        }
        else if(this.props.route.changes.length == 2) {
            components = <div className="panel-body row">
                <div className="col-xs-4">
                    <RenderRoute 
                        route={this.props.route.routes[0]} 
                        from={this.props.route.from} 
                        to={this.props.route.changes[0]} 
                        router={this.props.router}/>
                </div>
                <div className="col-xs-4">
                    <RenderRoute 
                        route={this.props.route.routes[1]} 
                        from={this.props.route.changes[0]} 
                        to={this.props.route.changes[1]} 
                        router={this.props.router}/>
                </div>
                <div className="col-xs-4">
                    <RenderRoute 
                        route={this.props.route.routes[2]} 
                        from={this.props.route.changes[1]} 
                        to={this.props.route.to} 
                        router={this.props.router}/>
                </div>
            </div>;
        }

        return (
            <div className={cssclass}>
                {recommended}
                {components}
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