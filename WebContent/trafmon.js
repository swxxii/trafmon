
/*******************************************************************************
 * 
 * TrafMon - iPhone app
 * 
 ******************************************************************************/

/*
 * Global Variables
 */

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
	DEFAULT_ZOOM_SUCCESS : 1,
	DEFAULT_NAVI_CONTROL : google.maps.NavigationControlStyle.ANDROID,

	/***************************************************************************
	 * Class Variables
	 **************************************************************************/

	// Initialise the default position
	position : {
		coords : {
			latitude : this.DEFAULT_LAT,
			longitude : this.DEFAULT_LONG
		}
	},

	// marker for user's position
	myMarker : false,

	/***************************************************************************
	 * METHODS: Google Maps API
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

	},

	/**
	 * The map needs to be refreshed after being hidden
	 */
	mapPageShown : function() {
		// there is no checkresize in v3! use this instead
		google.maps.event.trigger(map, 'resize');
		trafmon.updatePosition();
	},

	/***************************************************************************
	 * METHODS: Position
	 **************************************************************************/

	/**
	 * Update Position : one-off
	 */
	initPosition : function() {
		// get current location
		navigator.geolocation.getCurrentPosition(trafmon.initPositionSuccess,
				trafmon.initPositionFail);
	},

	/**
	 * Update Position: continuous updating
	 */
	updatePosition : function() {
		// watch current location
		navigator.geolocation.watchPosition(trafmon.watchPositionSuccess,
				trafmon.watchPositionFail);
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
	},

	/**
	 * Watcher position success
	 */
	watchPositionSuccess : function(position) {
		trafmon.setPosition(position);
		trafmon.updateMyMarker();
	},

	/**
	 * Watcher position fail
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
	 * Puts the familiar "glowing blue dot" marker
	 */
	updateMyMarker : function() {
		var myLatLng = trafmon.getPositionLatLng();

		// first time build the marker
		if (!trafmon.myMarker) {

			var image = new google.maps.MarkerImage(
					'images/blue_dot_circle.png', new google.maps.Size(38, 38), // size
					new google.maps.Point(0, 0), // origin
					new google.maps.Point(19, 19) // anchor
			);
			trafmon.myMarker = new google.maps.Marker({
						position : myLatLng,
						map : map,
						icon : image,
						clickable : false,
						draggable : false,
						flat : true
					});
		} else {
			// change marker position on subsequent passes
			trafmon.myMarker.set_position(myLatLng);
		}
		// center map view on every pass (this may be annoying)
		map.set_center(myLatLng);
	},

	/*
	 * custom overlay
	 */
	updateMyOverlay : function() {
		var myLatLng = trafmon.getPositionLatLng();

		// first time build the marker
		if (!trafmon.myOverlay) {
			var srcImage = 'images/blue_dot_circle.png';
			trafmon.myOverlay = new MyOverlay(myLatLng, srcImage, map);
		} else {
			// change marker position on subsequent passes
			trafmon.myOverlay.set_position(myLatLng);
		}
		// center map view on every pass (this may be annoying)
		map.set_center(myLatLng);
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

function MyOverlay(position, image, map) {

	// Now initialize all properties.
	this.position_ = position;
	this.image_ = image;
	this.map_ = map;

	// We define a property to hold the image's
	// div. We'll actually create this div
	// upon receipt of the add() method so we'll
	// leave it null for now.
	this.div_ = null;

	// Explicitly call setMap() on this overlay
	this.setMap(map);
}

MyOverlay.prototype = new google.maps.OverlayView();

MyOverlay.prototype.onAdd = function() {

	// Note: an overlay's receipt of onAdd() indicates that
	// the map's panes are now available for attaching
	// the overlay to the map via the DOM.

	// Create the DIV and set some basic attributes.
	var div = document.createElement('DIV');
	div.style.border = "0px solid none";
	div.style.position = "absolute";

	// Create an IMG element and attach it to the DIV.
	var img = document.createElement("img");
	img.src = this.image_;
	img.style.width = "100%";
	img.style.height = "100%";
	div.appendChild(img);

	// Set the overlay's div_ property to this DIV
	this.div_ = div;

	// We add an overlay to a map via one of the map's panes.
	// We'll add this overlay to the overlayImage pane.
	var panes = this.getPanes();
	panes.overlayImage.appendChild(div);
}

MyOverlay.prototype.draw = function() {

	// Size and position the overlay. We use a southwest and northeast
	// position of the overlay to peg it to the correct position and size.
	// We need to retrieve the projection from this overlay to do this.
	var overlayProjection = this.getProjection();

	// Retrieve the southwest and northeast coordinates of this overlay
	// in latlngs and convert them to pixels coordinates.
	// We'll use these coordinates to resize the DIV.
	var sw = overlayProjection
			.fromLatLngToDivPixel(this.bounds_.getSouthWest());
	var ne = overlayProjection
			.fromLatLngToDivPixel(this.bounds_.getNorthEast());

	// Resize the image's DIV to fit the indicated dimensions.
	var div = this.div_;
	div.style.left = sw.x + 'px';
	div.style.top = ne.y + 'px';
	div.style.width = (ne.x - sw.x) + 'px';
	div.style.height = (sw.y - ne.y) + 'px';
}

MyOverlay.prototype.onRemove = function() {
	this.div_.parentNode.removeChild(this.div_);
	this.div_ = null;
}

// Note that the visibility property must be a string enclosed in quotes
MyOverlay.prototype.hide = function() {
	if (this.div_) {
		this.div_.style.visibility = "hidden";
	}
}

MyOverlay.prototype.show = function() {
	if (this.div_) {
		this.div_.style.visibility = "visible";
	}
}

MyOverlay.prototype.toggle = function() {
	if (this.div_) {
		if (this.div_.style.visibility == "hidden") {
			this.show();
		} else {
			this.hide();
		}
	}
}

MyOverlay.prototype.toggleDOM = function() {
	if (this.getMap()) {
		this.setMap(null);
	} else {
		this.setMap(this.map_);
	}
}
