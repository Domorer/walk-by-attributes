let mapView = (function () {
    var map = L.map('map', {
        zoomControl: false,
        zoomDelta:0.5
    }).setView([41.8952, -87.55965], 11)

    var osmUrl = 'https://api.mapbox.com/styles/v1/keypro/cjjs6cawt25iq2snp6kqxu3r3/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia2V5cHJvIiwiYSI6ImNqamliaTJtbjV0YTMzcG82bmthdW03OHEifQ.UBWsyfRiWMYly4gIc2H7cQ',
        layer = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>'

    L.tileLayer(osmUrl, {
        minZoom: 1,
        maxZoom: 17,
        //用了mapbox的图层
        attribution: layer,
        //访问令牌
        accessToken: 'your.mapbox.access.token'
    }).addTo(map);

    function drawPL(links_arr, ids_arr) {
        d3.select('#map').selectAll('path').remove();
        console.log('links_arr: ', links_arr);
        function sum(arr) {
            let tmp_sum = 0
            for (let key in arr)
                tmp_sum += arr[key]
            return tmp_sum
        }
        let max_weight = d3.max(links_arr, d => sum(d.value)),
            min_weight = d3.min(links_arr, d => sum(d.value));
        let opScale = d3.scaleLinear().domain([min_weight, max_weight]).range([0.1, 1]);

        for (let i = 0; i < links_arr.length; i++) {
            let source_loc = variable.loc_dict[links_arr[i].source],
                target_loc = variable.loc_dict[links_arr[i].target]
            L.polyline([source_loc, target_loc], {
                color: 'gray',
                weight: 1,
                opacity: opScale(sum(links_arr[i].values))
            }).addTo(mapView.map)
        }
        mapView.map.setView([variable.loc_dict[ids_arr[0]].lat, variable.loc_dict[ids_arr[0]].lng], 11)
        for (let i = 0; i < ids_arr.length; i++) {
            L.circle(variable.loc_dict[ids_arr[i]], {
                color: 'red',
                radius: 50,
                fill: 'red'
            }).addTo(mapView.map)
        }
    }

    return {
        drawPL,
        map
    }
})()