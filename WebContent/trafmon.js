
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

	// location reporting enabled?
	REPORT_LOCATION : true,

	// list of markers (TrafficMarker objects)
	markers : [],

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
		alert('Are you sure you want to give us the deed to your house?');
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
	},

	/**
	 * Click event listener method
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

	/**
	 * toggle option to send location
	 */
	toggleReporting : function() {
		elem = document.getElementById('report_loc');
		toggled = elem.getAttribute('toggled')
		if (toggled == 'true')
			trafmon.REPORT_LOCATION = true;
		else if (toggled == 'false')
			trafmon.REPORT_LOCATION = false;

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
	 * Fetch some marker points using Ajax request
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
			params = "minLat=" + minLat + "&minLng=" + minLng + "&maxLat="
					+ maxLat + "&maxLng=" + maxLng + "";
			// send request
			xmlhttp.send(params);
		}
	},

	/**
	 * Fetch some marker points using Ajax request
	 * 
	 * @param {}
	 *            url: location of servlet waiting to recieve (must be on same
	 *            server) lat: users lattitude lng: users longitude bearing:
	 *            users bearing speed: users speed tag: information about users
	 *            travel mode. For example train number.
	 * @param {}
	 *            bounds: google maps LatLngBounds object
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
					+ "&speed=" + speed + "&tag=" + tag + "";
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
		// first delete all markers (TODO inefficient - should only delete
		// markers outside new bounds)
		for (i = 0; i < trafmon.markers.length; i++) {
			if (trafmon.markers[i])
				trafmon.markers[i].setMap(null);
		}
		// reset the markers field (hack!)
		trafmon.markers = [];
		// plot all new markers (TODO inefficient - should not replot markers
		// inside bounds which are already plotted, however they may have
		// changed so we should check for true equality on all points fields)
		for (i = 0; i < points.length; i++) {
			// get point coords as LatLng
			pointLatLng = new google.maps.LatLng(points[i].lat, points[i].lng)
			// skip points not within bounds - Google are supermega awesome for
			// their contains() function
			if (!bounds.contains(pointLatLng))
				continue;
			// (else) plot the marker
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
 *            data: object containing {position, speed, bearing, tag}
 * @param {}
 *            map: GMaps map object
 */
function TrafficMarker(data, map) {
	// get position out of data object & set LatLng
	this.latlng_ = new google.maps.LatLng(data.lat, data.lng);
	// default image dimensions
	this.imgDim_ = 16;

	// if data point is the user's location and not a traffic point
	if (data.own) {
		this.image_ = trafmon.IMAGE_BASE_URL + 'beacon.png';
		this.tagged_ = false;
		this.imgDim_ = 17;
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
	var div = this.div_;
	if (!div) {

		// TODO replace the DOM stuff with text???

		// Create a overlay text DIV
		div = this.div_ = document.createElement('DIV');
		// set various attributes
		div.style.border = "0px solid none";
		div.style.position = "absolute";
		div.style.padding = "0px";
		// div.style.cursor = 'pointer'; // nb only affects desktop
		div.style.width = this.imgDim_ + 'px';
		div.style.height = this.imgDim_ + 'px';
		div.style.background = 'url(' + this.image_ + ') no-repeat';
		div.style.filter = "alpha(opacity=75)"; // firefox
		div.style.opacity = "0.75"; // IE

		// create IMG inside DIV
		// var img = document.createElement("IMG");
		// img.src = this.image_;
		// div.appendChild(img);

		// TODO implement location tagging! only need this when object has
		// location tag
		// if (this.tagged_ != false) {
		// google.maps.event.addDomListener(div, "click", function(event) {
		// google.maps.event.trigger(this, "click");
		// });
		// }

		// Add the overlay to the DOM
		var panes = this.getPanes();
		panes.overlayImage.appendChild(div);
	}

	// Position the overlay
	var point = this.getProjection().fromLatLngToDivPixel(this.latlng_);
	if (point) {
		// subtract width/2 to center the image at LatLng
		div.style.left = (point.x - Math.floor(this.imgDim_ / 2)) + 'px';
		div.style.top = (point.y - Math.floor(this.imgDim_ / 2)) + 'px';
	}
};

/**
 * updates the marker with new position and redraws
 * 
 * @param {}
 *            data
 */
TrafficMarker.prototype.update = function(data) {
	this.latlng_ = new google.maps.LatLng(data.lat, data.lng);
	// Position the overlay
	var point = this.getProjection().fromLatLngToDivPixel(this.latlng_);
	if (point) {
		// subtract 5 to center the image
		div.style.left = (point.x - 5) + 'px';
		div.style.top = (point.y) - 5 + 'px';
	}

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
