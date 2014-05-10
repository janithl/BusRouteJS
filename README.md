Bus-Route-Finder-3.0
====================

JS rewrite of bus route finder ~~with lots of goodies~~

Currently in preliminary development, so these are subject to change
without notice.

Calling `Router.findRoutes()` with two integers will return a Javascript
object like this:

```javascript
Router.findRoutes(44, 45)

{
	"from":{
		"name":"Anula Vidyalaya",	
		"lat":6.87195,
		"lng":79.8843
	},
	"to":{
		"name":"Nugegoda",
		"lat":6.86932,
		"lng":79.8896
	},
	"routes":[
		{
			"buses":[
				[
					{"routeno":"138","from":"Pettah","to":"Kottawa","dist":656},
					{"routeno":"138","from":"Pettah","to":"Homagama","dist":656},
					{"routeno":"138","from":"Pettah","to":"Maharagama","dist":656},
					{"routeno":"138/2","from":"Pettah","to":"Mattegoda","dist":656},
					{"routeno":"138/4","from":"Pettah","to":"Athurugiriya","dist":656},
					{"routeno":"138/3","from":"Pettah","to":"Rukmalgama","dist":656}
				]
			],
			"dist":656,
			"changeovers":[]
		},
		{
			"buses":[
				[
					{"routeno":"125","from":"Pettah","to":"Padukka","dist":656},
					{"routeno":"125","from":"Pettah","to":"Ingiriya","dist":656}
				]
			],
			"dist":656,
			"changeovers":[]
		}
	]
}
```

Basically, the biggest improvement over the last (php) version is that it now
handles similar (almost duplicate, but alternate - like Kottawa/Pettah and Homagama/Pettah)
routes gracefully.
