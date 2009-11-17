
/*******************************************************************************
 * 
 * TrafMon - iPhone app
 * 
 ******************************************************************************/

/*
 * Global Variables
 */

// google maps API container
var map = false;

/*
 * Class: TrafMon
 */

trafmon = {

	/***************************************************************************
	 * Class Constants
	 **************************************************************************/

	/*
	 * Default application options (non-user configurable)
	 */

	DEFAULT_ZOOM : 15,
	DEFAULT_ZOOM_SUCCESS : 15,
	DEFAULT_NAVI_CONTROL : google.maps.NavigationControlStyle.ANDROID,
	IMAGE_BASE_URL : 'images/',
	MAP_CENTERED_ONCE : false,
	CHECKIN_DELAY_MILLIS : 10000,

	/*
	 * Keep track of which version are we running (set later by init methods)
	 */
	onDesktop : false,
	onPhone : false,

	/***************************************************************************
	 * Class Variables
	 **************************************************************************/

	/*
	 * Initialise the default position. This object designed to replicate
	 * structure of position recieved from geolocation API. This means you need
	 * to use the position.coords.latitude to get at the coordinates
	 * 
	 * This does not like being initialised with variables hence the hard coding
	 * current position (where we are now).
	 * 
	 * Default coords are near ICT.
	 */
	defaultPosition : {
		coords : {
			latitude : -37.798985,
			longitude : 144.964685
		}
	},
	/*
	 * Place to store CURRENT position once retrieved from API
	 */
	currPosition : {
		coords : {
			latitude : null,
			longitude : null
		}
	},
	// has the position been set by geolocation?
	currPositionUpdated : false,

	/*
	 * Place to store PREVIOUS position once retrieved from API
	 */
	prevPosition : {
		coords : {
			latitude : null,
			longitude : null
		}
	},
	// has the position been set by geolocation?
	prevPositionUpdated : false,

	// what was the last time we calculated speed/bearing? (init to now)
	previousTime : (new Date()).getTime(),

	// marker for user's position
	USER_MARKER : false,
	FIRST_CENTER : false,

	// store the list of markers (TrafficMarker objects)
	markers : [],

	// variables for the telemetry window node
	telemetryDrawn : false,

	/***************************************************************************
	 * TrafMon Options (defaults here, changed by GUI)
	 **************************************************************************/
	options : {
		// Front page GUI options
		trafficLayer : 1, // 1=car, 2=public
		locationTag : '', // any string value
		reportLocation : true, // boolean

		// 'Options' page options
		showCarPoints : true, // boolean
		showPubPoints : true, // boolean
		dayOfWeek : 0, // 0 = live, 1-7 = sun-sat
		timeRange : -1
		// -1 = all day, 0-4 = range

	},

	/**
	 * Method to toggle option to send location
	 */
	toggleReporting : function() {
		elem = document.getElementById('report_loc');
		toggled = elem.getAttribute('toggled')
		if (toggled == 'true')
			trafmon.options.reportLocation = true;
		else if (toggled == 'false')
			trafmon.options.reportLocation = false;
	},
	/**
	 * Method to toggle option to show car points
	 * 
	 * @param desktop:
	 *            (boolean) are we calling from the desktop version
	 */
	toggleShowCars : function(desktop) {
		if (desktop) {
			trafmon.options.showCarPoints = isChecked('show_cars');
			alert(trafmon.options.showCarPoints);
		} else {
			elem = document.getElementById('show_cars');
			toggled = elem.getAttribute('toggled')
			if (toggled == 'true')
				trafmon.options.showCarPoints = true;
			else if (toggled == 'false')
				trafmon.options.showCarPoints = false;
		}
		// trigger map to reload points as option changed
		google.maps.event.trigger(map, 'idle');

	},
	/**
	 * Method to toggle option to show public transport points
	 * 
	 * @param desktop:
	 *            (boolean) are we calling from the desktop version
	 */
	toggleShowPub : function(desktop) {
		if (desktop) {
			trafmon.options.showPubPoints = isChecked('show_public');
			// alert(trafmon.options.showPubPoints);
		} else {
			elem = document.getElementById('show_pub');
			toggled = elem.getAttribute('toggled')
			if (toggled == 'true')
				trafmon.options.showPubPoints = true;
			else if (toggled == 'false')
				trafmon.options.showPubPoints = false;
		}
		// trigger map to reload points as option changed
		google.maps.event.trigger(map, 'idle');

	},

	/**
	 * Method to set day of week option
	 * 
	 * @param {}
	 *            elem - calling element
	 * @param {}
	 *            val - internal int value to set
	 */
	setDayOpt : function(elem, val) {
		// update GUI
		dr = document.getElementById('day_opt_row');
		newopt = elem.innerHTML;
		setVal('day_opt', newopt);
		if (val == -1) {
			dr.setAttribute('class', 'arow last');
			hideElement('time_opt_row');
		} else {
			dr.setAttribute('class', 'arow');
			unHideBlockElement('time_opt_row');

		}
		// update internal variable
		trafmon.options.dayOfWeek = val;
		// trigger map to reload points as option changed
		google.maps.event.trigger(map, 'idle');

	},

	/**
	 * Sets the day option for desktop GUI (much simpler on desktop!)
	 */
	setDayOptDesktop : function() {
		val = getVal('day');
		trafmon.options.dayOfWeek = val;
		// alert(trafmon.options.dayOfWeek);
		// if select 'live traffic' (0), disable the timerange dropdown
		if (val == 0) {
			ableElement('timerange', false);
			setSelect('timerange', -1);
			trafmon.options.timeRange = -1;
		}
		// if select day, enable timerange dropdown
		else {
			ableElement('timerange', true);
		}
		// trigger map to reload points as option changed
		google.maps.event.trigger(map, 'idle');

	},

	/**
	 * Method to set time of day option
	 * 
	 * @param {}
	 *            elem - calling element
	 * @param {}
	 *            val - internal int value to set
	 */
	setTimeOpt : function(elem, val) {
		// update GUI
		newopt = elem.innerHTML;
		setVal('time_opt', newopt);
		// update internal variable
		trafmon.options.timeRange = val;
		// if select 'live traffic' (-1), reset the day option (incl. internal)
		if (val == -1) {
			setSelect('day', 0);
			trafmon.options.dayOfWeek = 0;
		}
		// trigger map to reload points as option changed
		google.maps.event.trigger(map, 'idle');

	},

	/**
	 * Sets the time range option for desktop GUI (much simpler on desktop!)
	 */
	setTimeOptDesktop : function() {
		trafmon.options.timeRange = getVal('timerange');
		// alert(trafmon.options.timeRange);
		// trigger map to reload points as option changed
		google.maps.event.trigger(map, 'idle');
	},

	/***************************************************************************
	 * METHODS: Google Maps API Initialisation
	 **************************************************************************/

	/**
	 * Initialize the Google Maps API (on iPhone)
	 */
	phoneInit : function() {
		trafmon.onPhone = true;
		// set location
		trafmon.initPosition();
		// do browser detection
		trafmon.detectBrowser();

	},

	/**
	 * Initialize the google maps api (desktop version)
	 */
	desktopInit : function() {
		trafmon.onDesktop = true;
		trafmon.telemetryDrawn = false;
		// redirect iphone clients
		// iPhoneRedirect('iphone.html');
		// get map options object
		var mapopts = trafmon.getMapOptions(true);
		// change controls
		mapopts.mapTypeControlOptions.style = google.maps.MapTypeControlStyle.DEFAULT;
		mapopts.navigationControlOptions.style = google.maps.NavigationControlStyle.DEFAULT;
		// instantiate the map
		map = new google.maps.Map(document.getElementById("map_canvas"),
				mapopts);
		// make sure the map knows its size
		google.maps.event.trigger(map, 'resize');

		// finished initialisation
		trafmon.commonMain();

	},

	/**
	 * Called when user clicks "start" and map page is shown
	 */
	mapPageShown : function() {
		trafmon.onPhone = true;
		// resize the map so it draws
		google.maps.event.trigger(map, 'resize');
		// start watching position
		trafmon.watchPosition();
		// finished initialisation
		trafmon.commonMain();

	},

	/***************************************************************************
	 * Common Main Method: runs on both iPhone and desktop versions once each
	 * has been initialised in their own way
	 **************************************************************************/
	commonMain : function() {
		// turn on event listeners
		trafmon.setListeners();
		trafmon.checkInLocation('DataPointServlet', 44, 33, 22, 11, 'tag');

		if (trafmon.onPhone) {
			setTimeout(trafmon.drawTelemetry, 1000);
		}

	},

	/**
	 * Initialises the telemetry panel
	 */
	drawTelemetry : function() {
		canvas = document.getElementById('map_canvas');
		tel = document.createElement('table');
		tel.setAttribute('id', 'telemetry');

		tel.style.left = parseInt(canvas.clientWidth) - 105 + 'px';
		tel.style.top = '28px';

		tel.innerHTML = '<tr><td colspan="2"><b>Telemetry</b></td></tr>'
				+ '<tr><td>Speed</td><td id="tel_speed">n/a</td></tr>'
				+ '<tr><td>Heading</td><td id="tel_bearing">n/a</td></tr>'
				+ '<tr><td>Accuracy</td><td id="tel_acc">n/a</td></tr>';

		// finally append the element to map canvas (once only)
		if (!trafmon.telemetryDrawn) {
			canvas.appendChild(tel);
			trafmon.telemetryDrawn = true;
		}
	},

	/**
	 * Updates all telemetry fields by setting the content of the TD's
	 * 
	 * @param {}
	 *            speed
	 * @param {}
	 *            bearing
	 * @param {}
	 *            acc
	 */
	updateTelemetry : function(speed, bearing, acc) {
		setVal('tel_speed', Math.round(speed) + ' km/h');
		setVal('tel_bearing', Math.round(bearing) + ' &deg;');
		setVal('tel_acc', Math.round(acc) + ' m');
	},

	/**
	 * updates position of telemetry when phone rotated.
	 */
	rotateTelemetry : function() {
		if (!trafmon.onPhone)
			return;
		elem = document.getElementById('telemetry');
		elem.style.left = parseInt(canvas.clientWidth) - 105 + 'px';
	},

	/***************************************************************************
	 * Install the GMaps API Event Listeners
	 **************************************************************************/
	setListeners : function() {
		// if for some reason, map is null, abort
		if (!map)
			return false;

		/*
		 * Click event: user clicks anywhere on the map (disabled - was for
		 * debug but may use in future)
		 * 
		 * google.maps.event.addListener(map, 'click', function(event) {
		 * trafmon.listenerClick(event); });
		 */

		/*
		 * Bounds-changed
		 * 
		 * NOTE! 'bounds_changed' is triggered way too often. Google are awesome
		 * and added an 'idle' event which fires after the map hasn't moved for
		 * a bit. 'idle' fires even if the (desktop) user is still dragging but
		 * has stopped. Also fires once after initial load.
		 */
		google.maps.event.addListener(map, 'idle', function() {
					// fires immediately at drag or zoom end so still need
					// some delay. 333 seems good after experiments
					setTimeout(trafmon.listenerBoundsChanged, 333);
				});

	},

	/**
	 * Bounds changed event listener
	 */
	listenerBoundsChanged : function() {
		// get new bounds
		bounds = map.getBounds();
		// invoke json request for points (which then invokes point plotter)
		trafmon.getPointsJSON('./DataPointServlet', bounds);
		// trafmon.getPointsJSON('data.json', bounds);
	},

	/**
	 * Click event listener method. Was mainly used to add fake points
	 * 
	 * @param {}
	 *            event: google.maps.MouseClick event
	 */
	listenerClick : function(event) {
		point = event.latLng;
		// alert(point);
		d = getVal('search');
		b = d.split(',')[0];
		s = d.split(',')[1];
		data = '{ "lat": ' + point.lat() + ', "lng": ' + point.lng()
				+ ', "bearing": ' + b + ',"speed":' + s + '}, ';
		txt = getVal('debug');
		setVal('debug', txt + data);
	},

	/***************************************************************************
	 * METHODS: Position updates
	 **************************************************************************/

	/**
	 * Init Position : called on load
	 */
	initPosition : function() {
		// get current location
		navigator.geolocation.getCurrentPosition(trafmon.initPositionSuccess,
				trafmon.initPositionFail);
	},

	/**
	 * Init Position success : Creates a GMap with current position
	 */
	initPositionSuccess : function(position) {
		// store current position internally
		trafmon.setPosition(position);
		// get map options object
		var mapopts = trafmon.getMapOptions(false);
		// instantiate the map
		map = new google.maps.Map(document.getElementById("map_canvas"),
				mapopts);
		// center map on current position
		map.set_center(trafmon.positionToLatLng(trafmon.currPosition));

		// finished initialisation
		trafmon.commonMain();

	},
	/**
	 * Init Position fail : Creates a GMap with defaults
	 */
	initPositionFail : function(position) {
		// get map options object with defaults
		var mapopts = trafmon.getMapOptions(true);
		// instantiate the map
		map = new google.maps.Map(document.getElementById("map_canvas"),
				mapopts);
		// center map on current position
		map.set_center(trafmon.getDefaultPositionLatLng());

		// finished initialisation
		trafmon.commonMain();

	},

	/**
	 * Update Position: called when map page shown
	 */
	watchPosition : function() {
		// watch current location
		navigator.geolocation.watchPosition(trafmon.watchPositionSuccess,
				trafmon.watchPositionFail);
	},

	/**
	 * Watcher position success - this is called EVERY 500 ms or so when the
	 * position updates, so don't want to do too much in here!
	 */
	watchPositionSuccess : function(position) {

		/*
		 * UPDATE POSITION & USER MARKER
		 */

		// store position
		trafmon.setPosition(position);
		// redraw user beacon marker (every time)
		trafmon.updateUserMarker();
		// center map at current position ONCE at startup
		if (!trafmon.MAP_CENTERED_ONCE) {
			map.set_center(trafmon.positionToLatLng(trafmon.currPosition));
			trafmon.MAP_CENTERED_ONCE = true;
		}

		/*
		 * SPEED AND BEARING CALCULATIONS
		 * 
		 * Note: there are built-in properties for speed and bearing (heading)
		 * in the W3C geolocation API, however it is not mandatory to include
		 * these in all implementations. Hence, we have decided to implement our
		 * own calculations.
		 * 
		 * See this URL for more info
		 * http://dev.w3.org/geo/api/spec-source.html#position_interface
		 */

		// calculate time difference
		var d = new Date();
		var currentTime = d.getTime();
		var timeDifference = currentTime - trafmon.previousTime;

		// only want to run every X seconds
		// TODO extract time delay as constant
		if ((timeDifference) >= 5000) {

			// alert(trafmon.previousPosition.coords.latitude + '\n'
			// + position.coords.latitude);

			// calculate speed and bearing ONLY IF we have set prevPosition
			if (trafmon.prevPositionUpdated) {
				var speed = trafmon.calculateSpeed(position,
						trafmon.prevPosition, timeDifference);
				var bearing = trafmon.calculateBearing(position,
						trafmon.prevPosition);

				// display telemetry on map GUI
				trafmon.updateTelemetry(speed, bearing,
						position.coords.accuracy)

				trafmon.checkInLocation("./DataPointServlet",
						trafmon.currPosition.coords.latitude,
						trafmon.currPosition.coords.longitude, Math
								.floor(bearing), Math.round(speed),
						trafmon.options.locationTag);
			}

			// reset time counter
			trafmon.previousTime = currentTime;
			// update previous position
			trafmon.setPrevPosition(trafmon.currPosition);

		}

	},

	/**
	 * Calculates speed in km/h over 2 points and a time difference. Adapted
	 * from http://www.movable-type.co.uk/scripts/latlong.html
	 * 
	 * @param {}
	 *            position: current position
	 * @param {}
	 *            oldPosition: old position
	 * @param {}
	 *            timeDif: time difference in milliseconds
	 * @return {} speed in km/h
	 */
	calculateSpeed : function(position, oldPosition, timeDif) {
		// lat 1 has to be old position
		var lat1 = oldPosition.coords.latitude;
		var lon1 = oldPosition.coords.longitude;
		// lat2 has to be current (new) position
		var lat2 = position.coords.latitude;
		var lon2 = position.coords.longitude;
		// calculate individual distances
		var dLat = toRad(lat2 - lat1);
		var dLon = toRad(lon2 - lon1);

		var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1))
				* Math.cos(toRad(lat2)) * Math.sin(dLon / 2)
				* Math.sin(dLon / 2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		var R = 6371; // km
		var dist = R * c;

		/* timeDif is in milliseconds so */
		var timeDifInHours = timeDif / 3600000;

		// return speed as distance(km)/time(h)
		return dist / timeDifInHours;

	},

	/**
	 * Calculates bearing (in degrees) given two positions. Adapted from
	 * http://www.movable-type.co.uk/scripts/latlong.html
	 * 
	 * @param {}
	 *            position: current position
	 * @param {}
	 *            oldPosition: previous position
	 * @return {} bearing in degrees (0-359.999)
	 */
	calculateBearing : function(position, oldPosition) {
		var lat1 = oldPosition.coords.latitude;
		var lon1 = oldPosition.coords.longitude;
		var lat2 = position.coords.latitude;
		var lon2 = position.coords.longitude;
		var dLat = toRad(lat2 - lat1);
		var dLon = toRad(lon2 - lon1);

		var y = Math.sin(dLon) * Math.cos(lat2);
		var x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1)
				* Math.cos(lat2) * Math.cos(dLon);
		var brng = toBearing(Math.atan2(y, x));

		return brng;
	},

	/**
	 * Watcher position fail - called when could not get location. currently
	 * does nothing
	 */
	watchPositionFail : function(err) {
		// we can handle specific failures below
		var msg;
		switch (err.code) {
			case err.UNKNOWN_ERROR :
				msg = "Unable to find your location";
				break;
			case err.PERMISSION_DENINED :
				msg = "Permissioned denied in finding your location";
				break;
			case err.POSITION_UNAVAILABLE :
				msg = "Your location is currently unknown";
				break;
			case err.BREAK :
				msg = "Attempt to find location took too long";
				break;
			default :
				msg = "Location detection not supported in browser";
		}
		// document.getElementById('info').innerHTML = msg;

		return true;
	},

	/***************************************************************************
	 * METHODS: Markers
	 **************************************************************************/

	/**
	 * User position marker: draws user marker (recreates every time)
	 */
	updateUserMarker : function() {
		// get a 'data point' for the user location so we can pass to the marker
		// constructor
		var data = trafmon.getUserDataPoint();
		// remove if it exists: remove by marker.setMap(null)
		if (trafmon.USER_MARKER != false) {
			trafmon.USER_MARKER.setMap(null);
		}
		// create new at new position
		trafmon.USER_MARKER = new TrafficMarker(data, map);

		// center map view on every pass (this is annoying and should be
		// user-triggered with a button)
		if (!trafmon.FIRST_CENTER) {
			map.set_center(trafmon.positionToLatLng(trafmon.currPosition));
			trafmon.FIRST_CENTER = true;
		}
	},

	/**
	 * Gets the right marker image based on bearing and speed
	 * 
	 * @param {}
	 *            bearing: in degrees (0-360), no minutes please!
	 * @param {}
	 *            speed: speed in km/hr
	 */
	getMarkerImage : function(bearing, speed) {
		// quantize the bearing to nearest marker interval
		deg = trafmon.snapBearing(bearing);
		// get the color
		color = trafmon.getSpeedColor(speed);
		// construct image URL
		return trafmon.IMAGE_BASE_URL + color + deg + '.png';
	},

	/**
	 * snaps a bearing to one of eight values indicating which marker to show We
	 * probably need more resolution than this... PS. if you can think of a
	 * neater way to implement this, feel free :-)
	 * 
	 * @param {}
	 *            bearing
	 */
	snapBearing : function(bearing) {
		if (bearing > 337.5 && bearing <= 360)
			return 0;
		if (bearing >= 0 && bearing <= 22.5)
			return 0;
		if (bearing > 22.5 && bearing <= 67.5)
			return 45;
		if (bearing > 67.5 && bearing <= 112.5)
			return 90;
		if (bearing > 112.5 && bearing <= 157.5)
			return 135;
		if (bearing > 157.5 && bearing <= 202.5)
			return 180;
		if (bearing > 202.5 && bearing <= 247.5)
			return 225;
		if (bearing > 247.5 && bearing <= 292.5)
			return 270;
		if (bearing > 292.5 && bearing <= 337.5)
			return 315;
	},

	/**
	 * Converts a speed in km/h to the desired marker color. The actual values
	 * are up for negotiation
	 * 
	 * @param {}
	 *            speed: number in km/hr
	 * @return {} a string representing the color
	 */
	getSpeedColor : function(speed) {
		// return 'amber';
		if (speed == 0)
			return 'black';
		if (speed > 0 && speed <= 20)
			return 'red';
		if (speed > 20 && speed <= 40)
			return 'amber';
		if (speed > 40)
			return 'green';
	},

	/***************************************************************************
	 * METHODS: JSON/Points Plotting
	 **************************************************************************/

	/**
	 * Fetch some marker points using Ajax request. Uses the trafmon internal
	 * options to filter which points to get (e.g. which layer)
	 * 
	 * @param {}
	 *            url: location to load (must be on same server)
	 * @param {}
	 *            bounds: google maps LatLngBounds object
	 */
	getPointsJSON : function(url, bounds) {
		// create request object
		var xmlhttp = false;
		if (window.XMLHttpRequest) {
			xmlhttp = new XMLHttpRequest();
		} else if (window.ActiveXObject) {
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		}
		// setup request
		if (xmlhttp) {
			xmlhttp.open('POST', url, true);
			xmlhttp.setRequestHeader("Content-type",
					"application/x-www-form-urlencoded");
			xmlhttp.onreadystatechange = function() {
				if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
					// when we have the data, invoke points plotter
					// json = JSON.parse(xmlhttp.responseText); // firefox
					json = eval('(' + xmlhttp.responseText + ')'); // safari
					trafmon.plotPoints(json, bounds);
				}
			};
			// override returned mime type (or firefox won't parse)
			xmlhttp.overrideMimeType("application/json");
			// construct params string
			ne = bounds.getNorthEast();
			sw = bounds.getSouthWest();
			minLat = sw.lat();
			minLng = sw.lng();
			maxLat = ne.lat();
			maxLng = ne.lng();
			/*
			 * calculate layer to retrieve. 1=cars only, 2=pub only, 3=both
			 * (treat like a bitfield)
			 */
			var layer = trafmon.options.showCarPoints ? 1 : 0
					+ trafmon.options.showPubPoints ? 2 : 0;
			params = "minLat=" + minLat + "&minLng=" + minLng + "&maxLat="
					+ maxLat + "&maxLng=" + maxLng + "" + "&day="
					+ trafmon.options.dayOfWeek + '&timerange='
					+ trafmon.options.timeRange + "&layer=" + layer;
			// send request
			xmlhttp.send(params);
		}
	},

	/**
	 * Report user location to database
	 * 
	 * @param {}
	 *            url: location of servlet waiting to recieve (must be on same
	 *            server)
	 * @param {}
	 *            lat: users latitude
	 * @param {}
	 *            lng: users longitude
	 * @param {}
	 *            bearing: user's bearing in degrees
	 * @param {}
	 *            speed: user's speed in km/h (nearest int)
	 * @param {}
	 *            tag: information about users travel mode, e.g. train number.
	 */
	checkInLocation : function(url, lat, lng, bearing, speed, tag) {
		// create request object
		var xmlhttp = false;
		if (window.XMLHttpRequest) {
			xmlhttp = new XMLHttpRequest();
		} else if (window.ActiveXObject) {
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		}
		// setup request
		if (xmlhttp) {
			xmlhttp.open('POST', url, true);
			xmlhttp.setRequestHeader("Content-type",
					"application/x-www-form-urlencoded");
			xmlhttp.onreadystatechange = function() {
				if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
					// code to do once request success
					;
				}
			};
			// override returned mime type (or firefox won't parse)
			// don't need this here
			// xmlhttp.overrideMimeType("application/json");

			params = "lat=" + lat + "&lng=" + lng + "&bearing=" + bearing
					+ "&speed=" + speed + "&tag=" + tag + "&layer="
					+ trafmon.options.trafficLayer;
			// send request
			xmlhttp.send(params);
		}
	},

	/**
	 * Plot the marker points recieved from JSON request
	 * 
	 * @param {}
	 *            points array of point objects to plot
	 * @return number of markers plotted.
	 */
	plotPoints : function(points, bounds) {
		// check for valid data
		if (!points)
			return false;

		/*
		 * NOTE: there is no easy way to tell if a marker has already been
		 * plotted without iterating through the list of existing markers and
		 * checking each, so we just delete them all. This is terribly
		 * inefficient due to unneccesary DOM operations.
		 */
		for (i = 0; i < trafmon.markers.length; i++) {
			// safety check
			if (!trafmon.markers[i])
				continue;
			trafmon.markers[i].setMap(null);
		}
		/*
		 * now we plot all the new markers
		 */
		trafmon.markers = [];
		for (i = 0; i < points.length; i++) {
			// get point coords as LatLng
			pointLatLng = new google.maps.LatLng(points[i].lat, points[i].lng)
			/*
			 * new marker OUTSIDE bounds - do not plot
			 */
			if (!bounds.contains(pointLatLng))
				continue;
			/*
			 * new marker INSIDE bounds - plot
			 */
			trafmon.markers[i] = new TrafficMarker(points[i], map);
		}
	},

	/***************************************************************************
	 * METHODS: Geocoding
	 **************************************************************************/

	/**
	 * Process geocoding request for query
	 */
	desktopGeoCode : function() {
		query = getVal('search');
		alert('you searched for ' + query);
	},

	/***************************************************************************
	 * METHODS: Getters & Setters / Misc
	 **************************************************************************/

	/**
	 * Set the current and prev positions given new position object from
	 * geolocation API
	 */
	setPosition : function(position) {
		trafmon.currPosition = position;
		trafmon.currPositionUpdated = true;
	},
	setPrevPosition : function(position) {
		trafmon.prevPosition = position;
		trafmon.prevPositionUpdated = true;
	},

	/**
	 * Converts a Geolocation API position object to Google Maps LatLng object
	 */
	positionToLatLng : function(position) {
		return new google.maps.LatLng(position.coords.latitude,
				position.coords.longitude);
	},

	/**
	 * gets the user position as a "data point"
	 * 
	 * @return {}
	 */
	getUserDataPoint : function() {
		data = {
			own : true,
			lat : trafmon.currPosition.coords.latitude,
			lng : trafmon.currPosition.coords.longitude
		};
		return data;
	},

	/**
	 * Get map options : a wrapper to get the map options neatly
	 * 
	 * @param {}
	 *            use_defaults: true if you want to use defaults, false if you
	 *            want to use actual position
	 */
	getMapOptions : function(use_defaults) {
		if (use_defaults) {
			return {
				// required params
				mapTypeId : google.maps.MapTypeId.ROADMAP,
				center : trafmon.positionToLatLng(trafmon.defaultPosition),
				zoom : trafmon.DEFAULT_ZOOM,

				// optional params
				navigationControl : true,
				navigationControlOptions : {
					style : trafmon.DEFAULT_NAVI_CONTROL
				},

				// enable map type dropdown
				mapTypeControlOptions : {
					style : google.maps.MapTypeControlStyle.DROPDOWN_MENU
				}
			};
		} else
			return {
				mapTypeId : google.maps.MapTypeId.ROADMAP,
				center : trafmon.positionToLatLng(trafmon.currPosition),
				zoom : trafmon.DEFAULT_ZOOM_SUCCESS,
				navigationControl : true,
				navigationControlOptions : {
					style : trafmon.DEFAULT_NAVI_CONTROL
				},

				mapTypeControlOptions : {
					style : google.maps.MapTypeControlStyle.DROPDOWN_MENU
				}
			};

	},

	/**
	 * Google's basic browser detection
	 */
	detectBrowser : function() {
		var useragent = navigator.userAgent;
		var mapdiv = document.getElementById("map_canvas");

		if (useragent.indexOf('iPhone') != -1
				|| useragent.indexOf('Android') != -1) {
			mapdiv.style.width = '100%';
			mapdiv.style.height = '100%';
		} else {
			mapdiv.style.width = '320px';
			mapdiv.style.height = '480px';
		}
	}

}

/*******************************************************************************
 * 
 * TrafMon - Custom Markers using overlays
 * 
 ******************************************************************************/

/**
 * Custom traffic speed marker
 * 
 * @param {}
 *            data: object containing {position, speed, bearing, tag} optionally
 *            if the 'own' attribute is set, draws as a beacon
 * 
 * @param {}
 *            map: GMaps map object
 */
function TrafficMarker(data, map) {
	// get position out of data object & set LatLng
	this.latlng_ = new google.maps.LatLng(data.lat, data.lng);
	// default image dimensions
	this.imgDim_ = 16;
	// has this been appended to the DOM? (efficiency)
	this.domAppend_ = false;

	// if data point is the user location beacon and not a traffic point
	if (data.own) {
		this.image_ = trafmon.IMAGE_BASE_URL + 'beacon.png';
		this.tagged_ = false;
		this.imgDim_ = 17;
		// else its a normal triangle marker
	} else {
		this.image_ = trafmon.getMarkerImage(data.bearing, data.speed);
		this.tagged_ = data.tagged;
	}

	// disable clicking and dragging (TODO: how?)

	// Once the LatLng and text are set, add the overlay to the map. This will
	// trigger a call to panes_changed which should in turn call draw.
	this.setMap(map);
}

TrafficMarker.prototype = new google.maps.OverlayView();

TrafficMarker.prototype.draw = function() {
	// Check if the div has been created.
	if (!this.div_) {
		// get pixel point of latlng
		var point = this.getProjection().fromLatLngToDivPixel(this.latlng_);
		// make div element
		this.div_ = document.createElement('div');
		// set class to add static css
		this.div_.setAttribute('class', 'trafficmarker');
		// construct style attribute. joining arrays is faster than using the
		// '+' concat. operator according to the interwebs
		var styleparts = ['width:', this.imgDim_, 'px;height:', this.imgDim_,
				'px;background:url(', this.image_, ') no-repeat;left:',
				(point.x - Math.floor(this.imgDim_ / 2)), 'px;top:',
				(point.y - Math.floor(this.imgDim_ / 2)), 'px;'];
		// set style attribute
		this.div_.setAttribute('style', styleparts.join(''));

		// TODO implement location tagging! only need this when object has
		// location tag
		// if (this.tagged_ != false) {
		// google.maps.event.addDomListener(div, "click", function(event) {
		// google.maps.event.trigger(this, "click");
		// });
		// }

	}

	// Add the overlay to the DOM
	var panes = this.getPanes();
	panes.overlayImage.appendChild(this.div_);

};

TrafficMarker.prototype.onRemove = function() {
	// Check if the overlay was on the map and needs to be removed.
	if (this.div_) {
		this.div_.parentNode.removeChild(this.div_);
		this.div_ = null;
	}
};

TrafficMarker.prototype.getPosition = function() {
	return this.latlng_;
};
function TrafficMarker(data, map) {
	// get position out of data object & set LatLng
	this.latlng_ = new google.maps.LatLng(data.lat, data.lng);
	// default image dimensions
	this.imgDim_ = 16;
	// has this been appended to the DOM? (efficiency)
	this.domAppend_ = false;

	// if data point is the user location beacon and not a traffic point
	if (data.own) {
		this.image_ = trafmon.IMAGE_BASE_URL + 'beacon.png';
		this.tagged_ = false;
		this.imgDim_ = 17;
		// else its a normal triangle marker
	} else {
		this.image_ = trafmon.getMarkerImage(data.bearing, data.speed);
		this.tagged_ = data.tagged;
	}

	// disable clicking and dragging (TODO: how?)

	// Once the LatLng and text are set, add the overlay to the map. This will
	// trigger a call to panes_changed which should in turn call draw.
	this.setMap(map);
}
