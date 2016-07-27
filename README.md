BusRouteJS
==========

A JS rewrite of bus route finder.

Currently in preliminary development, so everything is subject to change
without notice.

Demo
----

[There's a demo here](http://janithl.github.io/BusRouteJS/). You 
have to turn on touch event emulation on Chrome to access the modal screens.

Install
-------

Clone the repo and run `npm install`.

API
---

Creating a new Router object and calling  `.findRoutes(from, to)` where `from` is 
the source place ID and `to` is the destination place ID (both integers) will 
return an array of Javascript objects like this:

```javascript
var router = new Router();
router.findRoutes(252, 235);

[
	{
		"from":"252",
		"routes":[
			{"routes":["1","2","4","5","6","19","20"],"distance":4144},
			{"routes":["26"],"distance":3347}
		],
		"changes":["53"],
		"to":"235",
		"distance":7491
	},
	{
		"from":"252",
		"routes":[
			{"routes":["1","2","4","5","6","19","20"],"distance":12324},
			{"routes":["12","13","14"],"distance":6661}
		],
		"changes":["39"],
		"to":"235",
		"distance":18985
	},
	{
		"from":"252",
		"routes":[
			{"routes":["1","2","4","5","6","19","20"],"distance":12936},
			{"routes":["12","13","14"],"distance":7273}
		],
		"changes":["38"],
		"to":"235",
		"distance":20209
	},
	...
]
```

The biggest improvement over the last (PHP) version is that it now
handles similar (almost duplicate, but alternate - like Kottawa/Pettah and Homagama/Pettah)
routes gracefully, and runs completely on the clientside, with big popping 
Google Maps to boot.

License
-------

Released under a permissive MIT license.
