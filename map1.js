// Google Satellite Imagery

googlelink = '<a href="http://maps.google.com">Google Maps</a>';

var googleSLayer = L.tileLayer(

'http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {

attribution: 'Map data &copy; ' + googlelink,

maxZoom: 12,

subdomains:['mt0','mt1','mt2','mt3']

});

// Google Terrain Map

var googlePLayer = L.tileLayer(

'http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {

attribution: 'Map data &copy; ' + googlelink,

maxZoom: 12,

subdomains:['mt0','mt1','mt2','mt3']

});

// Define map

var map = L.map('map', {
center: [ -9.55, 46.05],
minZoom: 1,
zoom: 5,
layers: googlePLayer, coralGroup, townsGroup, bleachingGroup
});

// Get map extent for search and zoom function

var defaultBounds = map.getBounds();
var bounds;

//// Coral feature group

var coralGroup = L.layerGroup();

// Coral pop-up function

function coralPopup(feature, layer) {

// does this feature have a property named popupContent?

popUpText = "Name: " + feature.properties.NAME + "<br>Country: " + feature.properties.Country;

feature.properties.popupContent = popUpText;

if (feature.properties && feature.properties.popupContent) {

layer.bindPopup(feature.properties.popupContent);

}
//search and zoom in function

var str = document.getElementById("search").value;
var fname = feature.properties.NAME;
if (fname == str) {
map.fitBounds(layer.getBounds());
}

}

//Function to addCoral()

// Adds sorted coral names to select element

function addCoral() {

// Gets select element

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

//// Towns feature group

var townsGroup = L.layerGroup();

function townsPopup(feature, layer) {

popUpText = "Town: " + feature.properties.name;

feature.properties.popupContent = popUpText;

if (feature.properties && feature.properties.popupContent) {

layer.bindPopup(feature.properties.popupContent);

}

}

// Circle Marker

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

// Load geoJSON file and add to coralbleachingGroup

$.getJSON('/var/www/html/user/EAfrica_Coral_Bleaching.geo.json',

function(data) {

// Add geoJSON to map

L.geoJson(data, {

// Circle Marker
	pointToLayer: function(feature, latlng) {
	return new L.CircleMarker(latlng, {radius: 3,
	fillOpacity: 0.5,
	color: 'white',
	fillColor: 'white',
	weight: 1});
  },
onEachFeature: bleachingPopup
}).addTo(bleachingGroup);

}
);

// Map Control

// Basemaps for control

var baseLayers = {"Google Satellite": googleSLayer, 
					"Google Terrain": googlePLayer};

// geoJSON layerGroups for control

var featureLayers = {"Town": townsGroup,

"Coral": coralGroup, "Coral Bleaching": bleachingGroup};

// Add control to map

L.control.layers(baseLayers, featureLayers).addTo(map);

L.control.scale().addTo(map);