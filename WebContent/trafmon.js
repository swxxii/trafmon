
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
	 * Constants/Defaults
	 **************************************************************************/

	// Default map location (if geolocation fails)
	DEFAULT_LAT : -37.798985,
	DEFAULT_LONG : 144.964685,
	DEFAULT_ZOOM : 15,
	DEFAULT_ZOOM_SUCCESS : 15,
	DEFAULT_NAVI_CONTROL : google.maps.NavigationControlStyle.ANDROID,
	IMAGE_BASE_URL : 'images/',
	MAP_CENTERED_ONCE : false,

	/***************************************************************************
	 * Class Variables
	 **************************************************************************/

	// Initialise the default position. this is designed to replicate structure
	// of position recieved from geolocation API.
	// this does not like being initialised with variables hence the hard coding
	position : {
		coords : {
			latitude : -37.798985,
			longitude : 144.964685
		}
	},

	// marker for user's position
	USER_MARKER : false,
	FIRST_CENTER : false,

	// store the list of markers (TrafficMarker objects)
	markers : [],

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
			alert(trafmon.options.showPubPoints);
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
		trafmon.options.dayOfWeek = getVal('day');
		alert(trafmon.options.dayOfWeek);
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
		// trigger map to reload points as option changed
		google.maps.event.trigger(map, 'idle');

	},

	/**
	 * Sets the time range option for desktop GUI (much simpler on desktop!)
	 */
	setTimeOptDesktop : function() {
		trafmon.options.timeRange = getVal('timerange');
		alert(trafmon.options.timeRange);
		// trigger map to reload points as option changed
		google.maps.event.trigger(map, 'idle');
	},

	/***************************************************************************
	 * METHODS: Google Maps API Initialisation
	 **************************************************************************/

	/**
	 * Initialize the google maps api
	 */
	init_map : function() {
		// set location
		trafmon.initPosition();
		// do browser detection
		trafmon.detectBrowser();

	},

	/**
	 * Initialize the google maps api (desktop version)
	 */
	desktopInit : function() {
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
		// resize the map so it draws
		google.maps.event.trigger(map, 'resize');
		// start watching position
		trafmon.watchPosition();

		// finished initialisation
		trafmon.commonMain();

	},

	/***************************************************************************
	 * Common Main Method:
	 * 
	 * runs on both iPhone and desktop versions once each initialised
	 * 
	 **************************************************************************/
	commonMain : function() {
		// turn on event listeners
		trafmon.setListeners();
		trafmon.checkInLocation('DataPointServlet', 44, 33, 22, 11, 'tag');
	},

	/**
	 * GMaps API Event Listeners
	 */
	setListeners : function() {
		// if for some reason, map is null, abort
		if (!map)
			return false;

		/*
		 * Click event: user clicks anywhere on the map
		 */
		google.maps.event.addListener(map, 'click', function(event) {
					trafmon.listenerClick(event);
				});
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
		return;
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
		// store position internally to allow referencing by other methods
		trafmon.setPosition(position);
		// get map options object
		var mapopts = trafmon.getMapOptions(false);
		// instantiate the map
		map = new google.maps.Map(document.getElementById("map_canvas"),
				mapopts);
		// center map
		map.set_center(trafmon.getPositionLatLng());

		// finished initialisation
		trafmon.commonMain();

	},
	/**
	 * Init Position fail : Creates a GMap with defaults
	 */
	initPositionFail : function(position) {
		// store position internally to allow referencing by other methods
		trafmon.setPosition(position);
		// get map options object
		var mapopts = trafmon.getMapOptions(true);
		// instantiate the map
		map = new google.maps.Map(document.getElementById("map_canvas"),
				mapopts);
		map.set_center(trafmon.getPositionLatLng());

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
		// update internal position object
		trafmon.setPosition(position);
		if (!trafmon.MAP_CENTERED_ONCE) {
			// center map
			map.set_center(trafmon.getPositionLatLng());
			trafmon.MAP_CENTERED_ONCE = true;
		}
		// redraw the user position marker
		trafmon.updateUserMarker();
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
			map.set_center(trafmon.getPositionLatLng());
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
	 * Set the position given a position object from the geolocation API
	 */
	setPosition : function(position) {
		trafmon.position = position;
	},

	/**
	 * Returns the internal position as a Google Maps LatLng object
	 */
	getPositionLatLng : function() {
		return new google.maps.LatLng(trafmon.position.coords.latitude,
				trafmon.position.coords.longitude);
	},

	/**
	 * gets the user position as a "data point"
	 * 
	 * @return {}
	 */
	getUserDataPoint : function() {
		data = {
			own : true,
			lat : trafmon.position.coords.latitude,
			lng : trafmon.position.coords.longitude
		};
		return data;
	},

	/**
	 * Get map options : a wrapper to get the map options neatly
	 * 
	 * @param {}
	 *            use_defaults True if you want to use defaults, False if you
	 *            want to use position
	 */
	getMapOptions : function(use_defaults) {
		if (use_defaults) {
			return {
				// required params
				mapTypeId : google.maps.MapTypeId.ROADMAP,
				center : new google.maps.LatLng(trafmon.DEFAULT_LAT,
						trafmon.DEFAULT_LONG),
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
				center : new google.maps.LatLng(
						trafmon.position.coords.latitude,
						trafmon.position.coords.longitude),
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
