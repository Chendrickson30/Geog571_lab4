//goal: build tilestes in Mapbox and make interactive map of OR HUC10 watersheds (polygons) 
//the name of the watershed will appear when the mouse hovers over and area will pop-up when clicked

//1. get watershed data: used https://spatialdata.oregonexplorer.info/geoportal/details;id=4b1b008d5a764a209b2df040689c0779
// opened in qgis, converted to w84 projection, and saved as geojson file

//2.make a map object 
var map = L.map('map').setView([44.563, -123.265], 9);

// Style map in Mapbox studio, and use this link for help integrating it with leaflet:
// https://docs.mapbox.com/studio-manual/guides/publish-your-style/#mapboxjs-and-leaflet where you find
// this line of code https://api.mapbox.com/styles/v1/YOUR_USERNAME/YOUR_STYLE_ID/tiles/256/{z}/{x}/{y}?access_token=YOUR_MAPBOX_ACCESS_TOKEN
// to-do: style only for OR: https://docs.mapbox.com/help/tutorials/style-single-country/

L.tileLayer('https://api.mapbox.com/styles/v1/hendrcou/clt269nv7007701ra8q0td3aw/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGVuZHJjb3UiLCJhIjoiY2xzOWs5ZzI4MDcyZTJtbncwYmx4bmdpeSJ9.Lq9r97eWc4UxrF4j3SOrJA', {
    maxZoom: 18
}).addTo(map);

// fetch('data/HUC10.geojson')
//     .then(response => response.json())
//     .then(data => {
//         L.geoJSON(data, {
//             style: {
//                 color: '#02818a', // Set the polygon border color
//                 weight: 1, // Set the weight of borders 
//                 opacity: 1, // Set the opacity of borders 
//                 fillOpacity: 0.2 // Set the opacity of polygon fill 
//             }
//         }).addTo(map);
//     })
//     .catch(error => {
//         console.error('Error fetching GeoJSON data:', error);
//     });

fetch('data/HUC10.geojson')
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data, {
            style: style,
            onEachFeature: onEachFeature
        }).addTo(map);
    });
// control that shows info on hover
var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

info.update = function (props) {
    this._div.innerHTML = '<h4>OREGON HUC-10 WATERSHEDS</h4>' +  (props ?
        '<b>' + props.Name + '</b><br />' + props.AreaAcres + '  Acres'
        : 'Hover Over a Watershed');
};

info.addTo(map);

// function getColor(d) {
//     return d < 250000 ? '#0c2c84' :
//            d < 200000  ? '#225ea8' :
//            d < 150000  ? '#1d91c0' :
//            d < 130000  ? '#41b6c4':
//            d < 100000   ? '#7fcdbb' :
//            d < 5000   ? '#c7e9b4' :
//            d < 1300   ? '#969696' : '#FFEDA0';
// }

//color boarders and fill of watershed polygons 
function style(feature) {
    return {
        weight: 1,
        opacity: 1,
        color: '#252525',
        dashArray: '3',
        fillOpacity: 0.1,
        // fillColor: getColor(feature.properties.AreaAcres)
    };
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#f7f7f7',
        dashArray: '',
        fillOpacity: 0.5
    });

    layer.bringToFront();
    info.update(layer.feature.properties);
}

function resetHighlight(e) {
    var layer = e.target;
    layer.setStyle(style(layer.feature)); // Reset the style using the original style function
    info.update(); // Update the info control
}
