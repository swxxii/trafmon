
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

// init a global XmlHTTPRequest to use
var xmlhttp = false;
if (window.XMLHttpRequest) {
	xmlhttp = new XMLHttpRequest();
} else if (window.ActiveXObject) {
	xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
}

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
	DEFAULT_ZOOM : 14,
	DEFAULT_ZOOM_SUCCESS : 14,
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

		trafmon.setListeners();

		// draw a test marker with fake data object
		data = {
			lat : -37.7989,
			lng : 144.9646,
			bearing : 50,
			speed : 10,
			tagged : false
		}
		// we only need to instantiate and it is drawn
		trafmon.markers[0] = new TrafficMarker(data, map);

	},

	/**
	 * Called when user clicks "start" and map page is shown
	 */
	mapPageShown : function() {
		// resize the map so it draws
		google.maps.event.trigger(map, 'resize');
		// start watching position
		trafmon.watchPosition();

		// draw a test marker with fake data object
		data = {
			lat : -37.7989,
			lng : 144.9646,
			bearing : 50,
			speed : 10,
			tagged : false
		}
		// we only need to instantiate and it is drawn
		trafmon.markers[0] = new TrafficMarker(data, map);

	},

	/**
	 * GMaps API Event Listeners
	 */
	setListeners : function() {
		// if for some reason, map is null, abort
		if (!map)
			return false;

		/*
		 * Click event: 
		 */
		google.maps.event.addListener(map, 'click', function(event) {
					point = event.latLng;
					alert(point);
				});
		/*
		 * Bounds-changed - redraw markers
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

	listenerBoundsChanged : function() {
		// get new bounds
		bounds = map.getBounds();
		ne = bounds.getNorthEast();
		sw = bounds.getSouthWest();
		// do stuff
		alert('NE: ' + ne + ' SW:' + sw);

	},

	/***************************************************************************
	 * METHODS: Position updates
	 **************************************************************************/

	/**
	 * Init Position : called on load (note DIV will have 0x0 dimensions)
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
		
		trafmon.setListeners();

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
		
		trafmon.setListeners();

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
		// map.set_center(myLatLng);
	},

	// // old version - not used
	// updateMyMarker : function() {
	// var myLatLng = trafmon.getPositionLatLng();
	//
	// // first time build the marker
	// if (!trafmon.myMarker) {
	//
	// var image = new google.maps.MarkerImage(
	// 'images/blue_dot_circle.png', new google.maps.Size(38, 38), // size
	// new google.maps.Point(0, 0), // origin
	// new google.maps.Point(19, 19) // anchor
	// );
	// trafmon.myMarker = new google.maps.Marker({
	// position : myLatLng,
	// map : map,
	// icon : image,
	// clickable : false,
	// draggable : false,
	// flat : true
	// });
	// } else {
	// // change marker position on subsequent passes
	// trafmon.myMarker.set_position(myLatLng);
	// }
	// // center map view on every pass (this may be annoying)
	// map.set_center(myLatLng);
	// },
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
		if (bearing > 337.5 && bearing <= 22.5)
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
	this.imgDim_ = 11;

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
