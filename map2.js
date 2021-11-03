//Add variables

var url = '/var/www/html/user/offshoreEEZ.geo.json';  // my GeoJSON data source

var url1 = '/var/www/html/user/marinemammals.geo.json';  // my GeoJSON data source.
var url2 = '/var/www/html/user/East_Africa_Coral_Reef.geo.json'; 
var a = 'No Data'; 
var b = 'No Data'; 
var c = 'No Data'; 
var z = 'No Data'; 

// Define map

var map = L.map('map', {
center: [ -9.55, 46.05],
minZoom: 1,
zoom: 5,
});

// Google Satellite Imagery

googlelink = '<a href="http://maps.google.com">Google Maps</a>';

var googleSLayer = L.tileLayer(

'http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {

attribution: 'Map data &copy; ' + googlelink,

maxZoom: 12,

subdomains:['mt0','mt1','mt2','mt3']

});
	googleSLayer.addTo(map);

//Set up styles

function style1(feature) {  																		//County
    return {
        weight: 1,
			opacity: 0,
			color: 'orange',
			dashArray: '',
			fillOpacity: 0,
			fillColor: '#fff'
    };
};

	var highlight1 = {
		'fillColor': 'red',
		'weight': 1,
		'opacity': 0.1 
	};
	
		function forEachFeature(feature, layer) {
			/*
            var popupContent = "<p><b>Name: </b>"+ feature.properties.binomial +'</p>';
                "</br>Order: "+ feature.properties.order_ +
               
            layer.bindPopup(popupContent);

            layer.on("click", function (e) { 
               marinemammalsLayer.setStyle(style3); //resets layer colors
                layer.setStyle(highlight1);  //highlights selected.
				
							
            }); 
			*/
		}
	
// Null variable that will hold layer

var marinemammalsLayer = L.geoJson(null, {onEachFeature: forEachFeature, style: style1});

	$.getJSON(url1, function(data) {
        marinemammalsLayer.addData(data);
    });

 marinemammalsLayer.addTo(map); 

//Style coral Layer
	
// Set style function that sets fill color
function style3(feature) {  																		//County
    return {
        fillColor: 'blue',
        fillOpacity: .3,
        weight: 0.5,
        opacity: 0.1,
        color: 'blue',
        dashArray: '1'
    };
};

	var highlight1 = {
		'fillColor': 'yellow',
		'weight': 2,
		'opacity': 1
	};
	
		function forEachFeature(feature, layer) {
			/*
            var popupContent = "<p><b>Name: </b>"+ feature.properties.NAME +'</p>';
                "</br>Designation: "+ feature.properties.DESIG +
               
            layer.bindPopup(popupContent);

            layer.on("click", function (e) { 
                coralLayer.setStyle(style3); //resets layer colors
                layer.setStyle(highlight1);  //highlights selected.
				
							
            }); 
			*/
		}
	
// Null variable that will hold layer

var coralLayer = L.geoJson(null, {onEachFeature: forEachFeature, style: style3});

	$.getJSON(url2, function(data) {
        coralLayer.addData(data);
    });

 coralLayer.addTo(map); 

//Se offshore EEZ layer
	
// Set style function that sets fill color property

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

var offshoreEEZLayer = L.geoJson(null, { style: style});

	$.getJSON('/var/www/html/user/offshoreEEZ.geo.json', function(data) {
        offshoreEEZLayer.addData(data);
    });

 offshoreEEZLayer.addTo(map);
 
//Set up click event

  map.on('click',function(e){  
		lat = e.latlng.lat;
		lon = e.latlng.lng;
		ProcessClick(lat,lon)	
  });

//Create marker on click point

  var theMarker;
  var selPoly = [];
  var newgeojsonLayer;

//If marker intercepts another layer

  function ProcessClick(lat,lon){
	selPoly = [];
  
	if (theMarker != undefined) {
			  map.removeLayer(theMarker);
		};
		if (newgeojsonLayer != undefined) {
			  map.removeLayer(newgeojsonLayer);
		};	
		
		
	theMarker = L.marker([lat,lon]).addTo(map);
	
		coralLayer.eachLayer(function (layer) {
		
		isInside =turf.booleanPointInPolygon(theMarker.toGeoJSON(), layer.toGeoJSON());

		//If marker is inside coral layer
	
		if (isInside){
				//Push attributes to pop up
				a = "Coral Location: " + layer.feature.properties.NAME;
				console.log("Coral Location: " + layer.feature.properties.NAME);
		}
	});
	
	
	marinemammalsLayer.eachLayer(function (layer) {
		isInside =turf.booleanPointInPolygon(theMarker.toGeoJSON(), layer.toGeoJSON());
		//If marker is inside marine mammals layer
	
		if (isInside){
				//Push attributes to pop up
				b = "Mammal Species: " + layer.feature.properties.binomial;
				console.log("Mammal Species: " + layer.feature.properties.binomial);
		}
	});
	
	offshoreEEZLayer.eachLayer(function (layer) {
		isInside =turf.booleanPointInPolygon(theMarker.toGeoJSON(), layer.toGeoJSON());
		//If marker is inside offshore EZZ layer
		
		if (isInside){
			//Push attributes to pop up (selPoly.push(layer.feature);)
			console.log("Territory: " + layer.feature.properties.TERRITORY1);
			c = "Territory: " + layer.feature.properties.TERRITORY1;
		}
		
	})

//Attributes pushed to pop up layer with styling
	
	newgeojsonLayer = L.geoJson(selPoly, {
	color: 'orange',
		  fillOpacity: 0,
		  opacity: 1
	}).addTo(map);
	
	
	z = "Clicked Area Summary";

		popupModal(z, a, b, c); 
	
}

//Map Control

// Basemaps for control

var baseLayers = {"Google Satellite": googleSLayer};

// geoJSON layerGroups for control

var overlayMaps = {
    "Territories":offshoreEEZLayer,
	"Marine Mammals":marinemammalsLayer,
	"Coral":coralLayer
};	

// Add control to map

//Add layer control

L.control.layers(baseLayers, overlayMaps).addTo(map);

//Add scale to map

L.control.scale().addTo(map);

//PassedValue=b;  //passing the value passed to the bootstrap span tag

function popupModal(z, a,b,c){
	var facModal = $('#myModal');
	facModal.find('.modal-title').text("Further Information");
	facModal.find('#siteaddressTitle').text(z);
	facModal.find('#field1').text(a);
	facModal.find('#field2').text(b);
	facModal.find('#field3').text(c);
	facModal.appendTo("body").modal('show');
	facModal.draggable({handle: ".modal-header"	});

};
