let mapView = (function () {
    var map = L.map('map', {
        zoomSnap: 0,
        zoomDelta: 0.1,
        renderer: L.svg()
    }).setView([37.862651, 118.781876], 13)
    var osmUrl = 'https://api.mapbox.com/styles/v1/keypro/cjjs6cawt25iq2snp6kqxu3r3/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia2V5cHJvIiwiYSI6ImNqamliaTJtbjV0YTMzcG82bmthdW03OHEifQ.UBWsyfRiWMYly4gIc2H7cQ',
        layer = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>'

    L.tileLayer(osmUrl, {
        minZoom: 10,
        maxZoom: 17,
        //用了mapbox的图层
        attribution: layer
        //访问令牌
    }).addTo(map);
    return {

    }
})()