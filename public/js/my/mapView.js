let mapView = (function () {
    var map = L.map('map', {
        zoomControl: false,
        zoomDelta: 0.5
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
        let tmp_attrs = variable.param.comb.split('_')
        tmp_attrs.shift();
        console.log('links_arr: ', links_arr);
        function sum(arr, attrs) {
            // console.log('attrs: ', attrs);
            // console.log('arr: ', arr);
            let tmp_sum = 0
            for (let i = 0; i < attrs.length; i++)
                tmp_sum += arr[attrs[i]]
            return tmp_sum
        }
        links_arr.sort((a, b) => sum(b.value, tmp_attrs) - sum(a.value, tmp_attrs))
        let imptLink = []
        for (let i = 0; i < links_arr.length * 0.3; i++) {
            imptLink.push(links_arr[i])
        }
        let max_weight = d3.max(imptLink, d => sum(d.value, tmp_attrs)),
            min_weight = d3.min(imptLink, d => sum(d.value, tmp_attrs));
        console.log('max_weight: ', max_weight);
        let opScale = d3.scaleLinear().domain([min_weight, max_weight]).range([0.1, 1]);
        let lwScale = d3.scaleLinear().domain([min_weight, max_weight]).range([1, 3]);
        for (let i = 0; i < imptLink.length; i++) {
            let source_loc = variable.loc_dict[imptLink[i].source],
                target_loc = variable.loc_dict[imptLink[i].target]
            L.polyline([source_loc, target_loc], {
                color: 'gray',
                weight: lwScale(sum(imptLink[i].value, tmp_attrs)),
                opacity: opScale(sum(imptLink[i].value, tmp_attrs))
            }).addTo(mapView.map)
        }
        mapView.map.setView([variable.loc_dict[ids_arr[0]].lat, variable.loc_dict[ids_arr[0]].lng], 11)
        for (let i = 0; i < ids_arr.length; i++) {
            L.circle(variable.loc_dict[ids_arr[i]], {
                color: 'red',
                radius: 5,
                fill: 'red'
            }).addTo(mapView.map)
        }
    }

    function drawSk(id_arr) {
        d3.select('#map').selectAll('path').remove();
        //获取所有点的坐标用于获取边界点
        let color = 'gray'
        for (let i = 0; i < id_arr.length; i++) {
            let tmp_points = []
            if (i == id_arr.length - 1)
                color = 'red'
            for (let j = 0; j < id_arr[i].length; j++) {
                id_arr[i][j]['loc'] = variable.loc_dict[id_arr[i][j].id];
                L.circle(id_arr[i][j]['loc'], {
                    color: color,
                    radius: 5,
                    fill: 'red'
                }).addTo(mapView.map)
                tmp_points.push([id_arr[i][j]['loc'].lat, id_arr[i][j]['loc'].lng])
            }
            id_arr[i].area = hull(tmp_points, 10)
        }
        // color = d3.scaleOrdinal(d3.schemeCategory20);

        //根据type来划分,下标为一的代表当前选中的类，其余为后续类
        mapView.map.setView([id_arr[0][0]['loc'].lat, id_arr[0][0]['loc'].lng], 11)
        color = 'blue'
        let opacity = 0.5
        for (let i = 0; i < id_arr.length; i++) {
            // console.log(i)
            if (i == id_arr.length - 1){
                color = 'red'
                opacity = 1
            }
            console.log(color)
            // console.log('id_arr[i]: ', id_arr[i]['area']);
            L.polygon(id_arr[i]['area'], {
                color: color,
                weight: 2,
                fill:false,
                opacity:opacity
            }).addTo(mapView.map)

        }
       
    }

    return {
        drawPL,
        map,
        drawSk
    }
})()