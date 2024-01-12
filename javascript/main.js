/*******************************************************************************
 * Filename:    main.js
 * Purpose:     Choropleth Map of Calgary. 
 *              Shows the distribution of visible minority population in Calgary
 *
 * @author:     David Fiske
 * Date:        Jan 09, 2024
 * Version:     1.0
 *******************************************************************************/

/*******************************************************************************
 *               Base Tile Layer
 *******************************************************************************/

// Center the map view on Calgary
const map = L.map('map').setView([51.0281, -114.087], 10.85);


// Load and display the base tile layer on the map
const baseTileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    minZoom: 9.85,
	maxZoom: 19,
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);


/*******************************************************************************
 *               GeoJSON               
 *******************************************************************************/

var polygonVisibleMinority = createGeoJSONLayer(geographyData, 'P_TOTAL_VISIBLE',   createStyleFunction('P_TOTAL_VISIBLE'),   'Visible Minority').addTo(map);
var polygonArab			   = createGeoJSONLayer(geographyData, 'P_Arab',			createStyleFunction('P_Arab'),			  'Arab');
var polygonBlack		   = createGeoJSONLayer(geographyData, 'P_Black',		    createStyleFunction('P_Black'),			  'Black');
var polygonChinese		   = createGeoJSONLayer(geographyData, 'P_Chinese',		    createStyleFunction('P_Chinese'),		  'Chinese');
var polygonFilipino		   = createGeoJSONLayer(geographyData, 'P_Filipino',		createStyleFunction('P_Filipino'),		  'Filipino');
var polygonJapanese		   = createGeoJSONLayer(geographyData, 'P_Japanese',		createStyleFunction('P_Japanese'),		  'Japanese');
var polygonKorean		   = createGeoJSONLayer(geographyData, 'P_Korean',		    createStyleFunction('P_Korean'),		  'Korean');
var polygonLatinAmerican   = createGeoJSONLayer(geographyData, 'P_Latin_American',  createStyleFunction('P_Latin_American'),  'Latin American');
var polygonSouthAsian	   = createGeoJSONLayer(geographyData, 'P_South_Asian',	    createStyleFunction('P_South_Asian'),	  'South Asian');
var polygonSoutheastAsian  = createGeoJSONLayer(geographyData, 'P_Southeast_Asian', createStyleFunction('P_Southeast_Asian'), 'Southeast Asian');
var polygonWestAsian	   = createGeoJSONLayer(geographyData, 'P_West_Asian',	    createStyleFunction('P_West_Asian'),	  'West Asian');
var polygonNonVisible	   = createGeoJSONLayer(geographyData, 'P_NON_VISIBLE',	    createStyleFunction('P_NON_VISIBLE'),	  'White');

// Create the layer based on a specific column in the geographyData
function createGeoJSONLayer(data, propertyName, style, popupText) {    
	return L.geoJSON(data, {
        onEachFeature: function (feature, layer) {
            if (feature.properties[propertyName] > -1) {
                layer.bindPopup('<b>Dissemination Area: </b>' + feature.properties.DAUID +
                    '<br><b>Total Residents: </b>' + feature.properties.POPULATION +
                    '<br><b>' + popupText + ': </b>' + feature.properties[propertyName] + ' %');
            } else {
                layer.bindPopup('<b>Dissemination Area: </b>' + feature.properties.DAUID +
                    '<br><br><b>NO DATA!</b>');
            }
        },
        style: style
    });
}


/*******************************************************************************
 *               Layer Control               
 *******************************************************************************/

var overlays = {
    "Visible Minority":polygonVisibleMinority,
	"Arab":polygonArab,
	"Black":polygonBlack,
	"Chinese":polygonChinese,
	"Filipino":polygonFilipino,
	"Japanese":polygonJapanese,
	"Korean":polygonKorean,
	"Latin American":polygonLatinAmerican,
	"South Asian":polygonSouthAsian,
	"Southeast Asian":polygonSoutheastAsian,
	"West Asian":polygonWestAsian,
	"White":polygonNonVisible
};

/* 
L.control.layers(overlays,null,{
	collapsed:false,
}).addTo(map);
*/

// Create two instances of the layer control, one initially collapsed and the other initially expanded
var controlLayersCollapsed = L.control.layers(overlays, null, {
    collapsed: true,
});

var controlLayersExpanded = L.control.layers(overlays, null, {
    collapsed: false,
});

// Function to switch between the two layer controls based on the window height
function updateCollapseState() {
    if (window.innerHeight <= 600) {
        controlLayersCollapsed.addTo(map);
        map.removeControl(controlLayersExpanded);
    } else {
        map.removeControl(controlLayersCollapsed);
        controlLayersExpanded.addTo(map);
    }
}

// Event listener to update the collapsed property on window resize
window.addEventListener('resize', updateCollapseState);

// Call the function when the map is initially loaded
updateCollapseState();


/*******************************************************************************
 *               Choropleth Attributes               
 *******************************************************************************/

// Select the color for geographyData depending on STYLE value
function getColor(p) {
	return p > 80 ? '#800026' :
		   p > 70 ? '#BD0026' :
		   p > 60 ? '#E31A1C' :
		   p > 50 ? '#FC4E2A' :
		   p > 40 ? '#FD8D3C' :
		   p > 30 ? '#FEB24C' :
		   p > 20 ? '#FED976' :
		   p > 10 ? '#FFEDA0' :
		   p > -1 ? '#FFFFCC' : '#000000';
}

// Set the style based on a specific column in the geographyData
function createStyleFunction(propertyName) {
	return function (feature) {
		return {
			fillColor: getColor(feature.properties[propertyName]),
			weight: 0.3,
			opacity: 1,
			color: 'black',
			dashArray: '',
			fillOpacity: 0.7
		};
	};
}


/*******************************************************************************
 *               Custom Legend Control            
 *******************************************************************************/

var legendConfig = {
    position: 'bottomright',
    grades: [0, 10, 20, 30, 40, 50, 60, 70, 80],
    noDataLabel: 'N/A',
    title: 'Percent of<br>Population'
};

var legend = L.control({ position: legendConfig.position });

legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend'),
        grades = legendConfig.grades,
        labels = [];

    // Loop through the population distribution intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            '<div class="legendValues">' + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '</div>' : '+');
    }

    // Generate a label with a colored square for the interval with no data
    div.innerHTML +=
        '<i style="background:' + getColor(-1) + '"></i> ' +
        '<section id="nan">' + legendConfig.noDataLabel + '</section>';

    // Generate the legend title
    div.innerHTML += '<br>' + legendConfig.title;
    
    return div;
};

legend.addTo(map);

