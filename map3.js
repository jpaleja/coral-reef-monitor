// Google Satellite Imagery

googlelink = '<a href="http://maps.google.com">Google Maps</a>';

var googleSLayer = L.tileLayer(

'http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {

attribution: 'Map data &copy; ' + googlelink,

maxZoom: 15,

subdomains:['mt0','mt1','mt2','mt3']

});

// Google Terrain Map

var googlePLayer = L.tileLayer(

'http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {

attribution: 'Map data &copy; ' + googlelink,

maxZoom: 15,

subdomains:['mt0','mt1','mt2','mt3']

});

// Define map

var map = L.map('map', {
center: [ -9.55, 46.05],
minZoom: 1,
zoom: 5,
layers: googlePLayer, coralGroup, townsGroup, bleachingGroup
});

// Set up bounds of map for search and zoom in funtion

var defaultBounds = map.getBounds();
var bounds;

// Coral feature group

var coralGroup = L.layerGroup();

// Coral pop-up function

function coralPopup(feature, layer) {

// does this feature have a property named popupContent?

popUpText = "Name: " + feature.properties.NAME + "<br>Country: " + feature.properties.Country;

feature.properties.popupContent = popUpText;

if (feature.properties && feature.properties.popupContent) {

layer.bindPopup(feature.properties.popupContent);

}
//Search and zoom in function

var str = document.getElementById("search").value;
var fname = feature.properties.NAME;
if (fname == str) {
map.fitBounds(layer.getBounds());
}

}

//Fucntion addCoral()

// Adds sorted coral names to select element

function addCoral() {

// Get select element

var selectObj = document.getElementById("search");

$.getJSON('/var/www/html/user/East_Africa_Coral_Reef.geo.json',

function(data) {

// Create a sorted array of coral names

var cNames = [];

for (i = 0; i < data.features.length; i++) {

cNames.push(data.features[i].properties.NAME);

}

cNames.sort();

// Create 'welcome' option

var option = document.createElement("option");

option.text = "Select Coral Reef";

selectObj.add(option);

// Add coral options

for (i = 0; i < cNames.length; i++) {

option = document.createElement("option");

option.text = cNames[i];

selectObj.add(option);

}

}

);

}

// Function draw()

// Draws the map

function draw() {

// Remove coral layergroup if exists

if (map.hasLayer(coralGroup)) {

coralGroup.clearLayers();

}

// Draw coral

$.getJSON('/var/www/html/user/East_Africa_Coral_Reef.geo.json',

function(data) {

// Add geoJSON to map

L.geoJson(data, {

style: function(feature) {

str = document.getElementById("search").value;

if (feature.properties.NAME == str) {

return {color: "#ff0000", weight: 1};

} else {

return {color: "#33AFFF", weight: 1};

}

},

onEachFeature: coralPopup

}).addTo(coralGroup);

}

);

coralGroup.addTo(map);

// Search and zoom in function

if (document.getElementById("search").value =="Select Coral Reef")
{
map.fitBounds(defaultBounds);
}
}

// Add coral to select element

addCoral();

// Towns feature group

var townsGroup = L.layerGroup();

function townsPopup(feature, layer) {

popUpText = "Town: " + feature.properties.name;

feature.properties.popupContent = popUpText;

if (feature.properties && feature.properties.popupContent) {

layer.bindPopup(feature.properties.popupContent);

}

}

// Circle Marker and styling towns

var markerOptions = {

radius: 1,

fillColor: "#000000",

color: "#000000",

weight: 1,

opacity: 1,

fillOpacity: 0.5
};

// Load geoJSON file and add to townsGroup

$.getJSON('/var/www/html/user/EAfrica_Towns.geo.json',

function(data) {

// Add geoJSON to map

L.geoJson(data, {

onEachFeature: townsPopup,

pointToLayer: function (feature, latlng) {

return L.circleMarker(latlng, markerOptions);

}

}).addTo(townsGroup);

}

);

//// Coral bleaching feature group

var  bleachingGroup = L.layerGroup();

function bleachingPopup(feature, layer) {

popUpText = "Location: " + feature.properties.LOCATION 
+ "<br>Country: " + feature.properties.COUNTRY 
+ "<br>Comments:" + feature.properties.REMARKS;

feature.properties.popupContent = popUpText;

if (feature.properties && feature.properties.popupContent) {

layer.bindPopup(feature.properties.popupContent);

}

}

// Colour scheme for coral bleaching layer

function getColor(BLEACHING_) {
	switch (BLEACHING_) {	
			case 'Unknown Severity':
				return "white";
			case 'No Bleaching':
				return "white";
			case 'Low':
				return "grey";
			case 'Medium':
				return "orange";
			case 'HIGH':
				return "red";
			}
		}

// Load geoJSON file and add to bleachingGroup

$.getJSON('/var/www/html/user/EAfrica_Coral_Bleaching.geo.json',

function(data) {

// Add geoJSON to map

L.geoJson(data, {

// Coral bleaching circle marker styling
	pointToLayer: function(feature, latlng) {
	return new L.CircleMarker(latlng, {radius: 3,
	fillOpacity: 0.5,
	color: 'white',
	fillColor: getColor(feature.properties.BLEACHING_),
	weight: 1});
  },
onEachFeature: bleachingPopup
}).addTo(bleachingGroup);

}
);
//Add offshore EEZ group
	
// Set style function that sets fill color

function style(feature) {
    return {
        fillColor: 'green', 
        fillOpacity: 0,  
        weight: 1,
        opacity: 0.4,
        color: '#ffffff',
        dashArray: '1'
    };
}

// Null variable that will hold layer

var offshoreEEZGroup = L.geoJson(null, { style: style});

	$.getJSON('/var/www/html/user/offshoreEEZ.geo.json', function(data) {
        offshoreEEZGroup.addData(data);
    });

 offshoreEEZGroup.addTo(map);


// Map Control

// Basemaps for control

var baseLayers = {"Google Satellite": googleSLayer, 
					"Google Terrain": googlePLayer};

// geoJSON layerGroups for control

var featureLayers = {"Town": townsGroup,

"Coral": coralGroup, "Coral Bleaching": bleachingGroup, "Territories": offshoreEEZGroup};

// Add control to map

L.control.layers(baseLayers, featureLayers, {position: 'bottomright'}).addTo(map);

//Add scale to map

L.control.scale().addTo(map);

//Set up edited layer for leaflet.draw function

  var editedLayers = new L.FeatureGroup();
    map.addLayer(editedLayers);
    
//Custom marker for drawing point

    var CustomMarker = L.Icon.extend({
        options: {
            shadowUrl: null,
            iconAnchor: new L.Point(12, 12),
            iconSize: new L.Point(24, 30),
            iconUrl: '/var/www/html/user/marker-icon.png'
        }
    });

//Set up geometry variable options
    
    var options = {
        position: 'topleft',
        draw: {
            polyline: {
                shapeOptions: {
                    color: '#f357a1',
                    weight: 10
                }
            },
            polygon: {
                allowIntersection: false, // Restricts shapes to simple polygons
                drawError: {
                    color: '#e1e100', // Color the shape will turn when intersects
                    message: 'This shape cant be drawn' // Message that will show when intersect
                },
                shapeOptions: {
                    color: '#bada55'
                }
            },
            circle: false, // Turns off this drawing tool
            rectangle: {
                shapeOptions: {
                    clickable: false
                }
            },
            marker: {
                icon: new CustomMarker()
            }
        },
        edit: {
            featureGroup: editedLayers, //edit layers and settings
            remove: true
        }
    };
    
//Set up draw control for new layer

    var drawControl = new L.Control.Draw(options);
    map.addControl(drawControl);
    
map.on('draw:created', function (event) {
    var layer = event.layer,
    	feature = layer.feature = layer.feature || {};
    
    feature.type = feature.type || "Feature";
    var props = feature.properties = feature.properties || {};
    //layer.feature = {properties: {}}; 
    //var props = layer.feature.properties;
    props.desc = "Enter Location and Description";
    editedLayers.addLayer(layer);
    addPopup(layer);
});

//Add a pop up to allow text to be added to a feature

function addPopup(layer) {
	var content = document.createElement("textarea");
    content.addEventListener("keyup", function () {
    	layer.feature.properties.desc = content.value;
    });
    layer.on("popupopen", function () {
    	content.value = layer.feature.properties.desc;
      content.focus();
    });
    layer.bindPopup(content).openPopup();
}
//Export to geoJSON function

document.getElementById('export').onclick = function(event) {
            // Extract GeoJson from featureGroup

            var data = editedLayers.toGeoJSON();

            // Stringify the GeoJson

            var convertedData = 'text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data));

            // Create export

            document.getElementById('export').setAttribute('href', 'data:' + convertedData);
            document.getElementById('export').setAttribute('download','data.geojson');
		}
function zoomTo() {
        var lat = document.getElementById("lat").value;
        var lng = document.getElementById("lng").value;
        map.panTo(new L.LatLng(lat, lng));
    }   