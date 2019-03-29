let radarChart = (function () {
    let radar_g;
    function draw(cluster) {
        let svgWidth = $('#svg_radar')[0].scrollWidth;
        let svgHeight = $('#svg_radar')[0].scrollHeight;
        let margin = { top: svgHeight * 0.1, left: svgWidth * 0.1, right: svgWidth * 0.1, bottom: svgHeight * 0.05 }
        ////////////////////////////////////////////////////////////// 
        ////////////////////////// Data ////////////////////////////// 
        ////////////////////////////////////////////////////////////// 
        //此时的每条线应该代表的是类内的一个点，点在每个属性上的值代表该点与类内点的连线轨迹的权重值和除于该点所有连线的权重之和
        //计算均值
        let average_value = new Array(5).fill(0);
        let value_arr = [];
        let tmp_ids = letiable.cluster_ids_dict[cluster]
        for (let i = 0; i < tmp_ids.length; i++) {
            let tmp_targets = letiable.station_links_dict[tmp_ids[i]];
            let inner_value = new Array(5).fill(0), outer_value = new Array(5).fill(0);
            for (let j = 0; j < tmp_targets.length; j++) {
                let tmp_link_key = Math.min(parseInt(tmp_ids[i]), parseInt(tmp_targets[j])) + '_' + Math.max(parseInt(tmp_ids[i]), parseInt(tmp_targets[j]));
                if (tmp_ids.indexOf(tmp_targets[j]) != -1)
                    for (let a = 0; a < 5; a++)
                        inner_value[a] += letiable.period_dict[tmp_link_key][a]
                if (tmp_ids.indexOf(tmp_targets[j]) == -1)
                    for (let a = 0; a < 5; a++)
                        outer_value[a] += letiable.period_dict[tmp_link_key][a]
            }
            let ratio_arr = new Array(5);
            for (let a = 0; a < 5; a++) {
                if (inner_value[a] == 0 && outer_value[a] == 0)
                    ratio_arr[a] = 0;
                else
                    ratio_arr[a] = inner_value[a] / (inner_value[a] + outer_value[a])
            }
            value_arr.push(ratio_arr);
            for (let a = 0; a < ratio_arr.length; a++) {
                average_value[a] += ratio_arr[a] / tmp_ids.length;
            }
        }
        //计算方差
        let letianceArr = new Array(5).fill(0);
        for (let i = 0; i < value_arr.length; i++) {
            for (let j = 0; j < 5; j++) {
                letianceArr[j] += Math.pow(average_value[j] - value_arr[i][j], 2) / value_arr.length;
            }
        }
        let aveScale = d3.scaleLinear().domain(d3.extent(average_value)).range([0.3, 0.8])
        let letianceScale = d3.scaleLinear().domain(d3.extent(letianceArr)).range([0.05, 0.2])
        let area_letiance = [];
        for (let i = 0; i < letianceArr.length; i++) {
            let tmp_dict = {}
            tmp_dict['inner'] = aveScale(average_value[i]) - letianceScale(letianceArr[i])
            tmp_dict['outer'] = aveScale(average_value[i]) + letianceScale(letianceArr[i])
            area_letiance.push(tmp_dict)
        }
        let data = [[], []];
        for (let i = 0; i < average_value.length; i++) {
            data[0].push({ axis: letiable.time_arr[i], value: aveScale(average_value[i]) })
        }
        console.log('data: ', data);
        // 
        ////////////////////////////////////////////////////////////// 
        //////////////////// Draw the Chart ////////////////////////// 
        ////////////////////////////////////////////////////////////// 
        let color = d3.scaleOrdinal()
            .range(["#EDC951", "#CC333F", "#00A0B0"]);

        //Call function to draw the Radar chart
        let id = '#svg_radar'

        let cfg = {
            w: svgWidth * 0.8,				//Width of the circle
            h: svgHeight * 0.8,				//Height of the circle
            margin: margin, //The margins of the SVG
            levels: 5,				//How many levels or inner circles should there be drawn
            maxValue: 1, 			//What is the value that the biggest circle will represent
            labelFactor: 1.15, 	//How much farther than the radius of the outer circle should the labels be placed
            wrapWidth: 60, 		//The number of pixels after which a label needs to be given a new line
            opacityArea: 0.35, 	//The opacity of the area of the blob
            dotRadius: 4, 			//The size of the colored circles of each blog
            opacityCircles: 0.1, 	//The opacity of the circles of each blob
            strokeWidth: 2, 		//The width of the stroke around each blob
            roundStrokes: true,	//If true the area and stroke will follow a round path (cardinal-closed)
            color: color	//Color function
        };

        //Put all of the options into a letiable called cfg
        if ('undefined' !== typeof options) {
            for (let i in options) {
                if ('undefined' !== typeof options[i]) { cfg[i] = options[i]; }
            }//for i
        }//if

        //If the supplied maxValue is smaller than the actual one, replace by the max in the data
        let maxValue = Math.max(cfg.maxValue, d3.max(data, function (i) { return d3.max(i.map(function (o) { return o.value; })) }));

        let allAxis = (data[0].map(function (i, j) { return i.axis })),	//Names of each axis
            total = allAxis.length,					//The number of different axes
            radius = Math.min(cfg.w / 2, cfg.h / 2), 	//Radius of the outermost circle
            Format = d3.format('.0%'),			 	//Percentage formatting
            angleSlice = Math.PI * 2 / total;		//The width in radians of each "slice"

        //Scale for the radius
        let rScale = d3.scaleLinear()
            .range([0, radius])
            .domain([0, maxValue]);

        /////////////////////////////////////////////////////////
        //////////// Create the container SVG and g /////////////
        /////////////////////////////////////////////////////////

        //Remove whatever chart with the same id/class was present before
        d3.select(id).select("svg").remove();

        //Initiate the radar chart SVG
        let svg = d3.select(id).append("svg")
            .attr("width", cfg.w + cfg.margin.left + cfg.margin.right)
            .attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
            .attr("class", "radar" + id);
        //Append a g element		
        radarChart.radar_g = svg.append("g")
            .attr("transform", "translate(" + (cfg.w / 2 + cfg.margin.left) + "," + (cfg.h / 2 + cfg.margin.top) + ")");

        /////////////////////////////////////////////////////////
        ////////// Glow filter for some extra pizzazz ///////////
        /////////////////////////////////////////////////////////

        //Filter for the outside glow
        let filter = radarChart.radar_g.append('defs').append('filter').attr('id', 'glow'),
            feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'coloredBlur'),
            feMerge = filter.append('feMerge'),
            feMergeNode_1 = feMerge.append('feMergeNode').attr('in', 'coloredBlur'),
            feMergeNode_2 = feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

        /////////////////////////////////////////////////////////
        /////////////// Draw the Circular grid //////////////////
        /////////////////////////////////////////////////////////

        //Wrapper for the grid & axes
        let axisGrid = radarChart.radar_g.append("g").attr("class", "axisWrapper");

        //Draw the background circles
        axisGrid.selectAll(".levels")
            .data(d3.range(1, (cfg.levels + 1)).reverse())
            .enter()
            .append("circle")
            .attr("class", "gridCircle")
            .attr("r", function (d, i) { return radius / cfg.levels * d; })
            .style("fill", "#CDCDCD")
            .style("stroke", "#CDCDCD")
            .style("fill-opacity", cfg.opacityCircles)
            .style("filter", "url(#glow)");

        //Text indicating at what % each level is
        axisGrid.selectAll(".axisLabel")
            .data(d3.range(1, (cfg.levels + 1)).reverse())
            .enter().append("text")
            .attr("class", "axisLabel")
            .attr("x", 4)
            .attr("y", function (d) { return -d * radius / cfg.levels; })
            .attr("dy", "0.4em")
            .style("font-size", "10px")
            .attr("fill", "#737373")
        // .text(function (d, i) { return Format(maxValue * d / cfg.levels); });

        /////////////////////////////////////////////////////////
        //////////////////// Draw the axes //////////////////////
        /////////////////////////////////////////////////////////

        //***************画属性坐标轴*****************
        let axis = axisGrid.selectAll(".axis")
            .data(allAxis)
            .enter()
            .append("g")
            .attr("class", "axis");
        //Append the lines
        axis.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", function (d, i) { return rScale(maxValue * 1) * Math.cos(angleSlice * i - Math.PI / 2); })
            .attr("y2", function (d, i) { return rScale(maxValue * 1) * Math.sin(angleSlice * i - Math.PI / 2); })
            .attr("class", "line")
            .style("stroke", (d, i) => letiable.attr_color[i])
            .style("stroke-width", "2px");

        //Append the labels at each axis
        axis.append("text")
            .attr("class", "legend")
            .style("font-size", "11px")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("x", function (d, i) { return rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice * i - Math.PI / 2); })
            .attr("y", function (d, i) { return rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice * i - Math.PI / 2); })
            .text(function (d) { return d })
            .call(wrap, cfg.wrapWidth);

        /////////////////////////////////////////////////////////
        ///////////// Draw the radar chart blobs ////////////////
        /////////////////////////////////////////////////////////



        /////////////////////////////////////////////////////////
        /////////////////// Helper Function /////////////////////
        /////////////////////////////////////////////////////////

        //Taken from http://bl.ocks.org/mbostock/7555321
        //Wraps SVG text	
        function wrap(text, width) {
            text.each(function () {
                let text = d3.select(this),
                    words = text.text().split(/\s+/).reverse(),
                    word,
                    line = [],
                    lineNumber = 0,
                    lineHeight = 1.4, // ems
                    y = text.attr("y"),
                    x = text.attr("x"),
                    dy = parseFloat(text.attr("dy")),
                    tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

                while (word = words.pop()) {
                    line.push(word);
                    tspan.text(line.join(" "));
                    if (tspan.node().getComputedTextLength() > width) {
                        line.pop();
                        tspan.text(line.join(" "));
                        line = [word];
                        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                    }
                }
            });
        }//wrap	

    }

    function addRadar() {
        //此时的每条线应该代表的是类内的一个点，点在每个属性上的值代表该点与类内点的连线轨迹的权重值和除于该点所有连线的权重之和
        //计算均值
        let average_value = new Array(5).fill(0);
        let value_arr = [];
        let tmp_ids = letiable.cluster_ids_dict[cluster]
        for (let i = 0; i < tmp_ids.length; i++) {
            let tmp_targets = letiable.station_links_dict[tmp_ids[i]];
            let inner_value = new Array(5).fill(0), outer_value = new Array(5).fill(0);
            for (let j = 0; j < tmp_targets.length; j++) {
                let tmp_link_key = Math.min(parseInt(tmp_ids[i]), parseInt(tmp_targets[j])) + '_' + Math.max(parseInt(tmp_ids[i]), parseInt(tmp_targets[j]));
                if (tmp_ids.indexOf(tmp_targets[j]) != -1)
                    for (let a = 0; a < 5; a++)
                        inner_value[a] += letiable.period_dict[tmp_link_key][a]
                if (tmp_ids.indexOf(tmp_targets[j]) == -1)
                    for (let a = 0; a < 5; a++)
                        outer_value[a] += letiable.period_dict[tmp_link_key][a]
            }
            let ratio_arr = new Array(5);
            for (let a = 0; a < 5; a++) {
                if (inner_value[a] == 0 && outer_value[a] == 0)
                    ratio_arr[a] = 0;
                else
                    ratio_arr[a] = inner_value[a] / (inner_value[a] + outer_value[a])
            }
            value_arr.push(ratio_arr);
            for (let a = 0; a < ratio_arr.length; a++) {
                average_value[a] += ratio_arr[a] / tmp_ids.length;
            }
        }
        //计算方差
        let letianceArr = new Array(5).fill(0);
        for (let i = 0; i < value_arr.length; i++) {
            for (let j = 0; j < 5; j++) {
                letianceArr[j] += Math.pow(average_value[j] - value_arr[i][j], 2) / value_arr.length;
            }
        }
        let aveScale = d3.scaleLinear().domain(d3.extent(average_value)).range([0.3, 0.8])
        let letianceScale = d3.scaleLinear().domain(d3.extent(letianceArr)).range([0.05, 0.2])
        let area_letiance = [];
        for (let i = 0; i < letianceArr.length; i++) {
            let tmp_dict = {};
            tmp_dict['inner'] = aveScale(average_value[i]) - letianceScale(letianceArr[i])
            tmp_dict['outer'] = aveScale(average_value[i]) + letianceScale(letianceArr[i])
            area_letiance.push(tmp_dict)
        }
        let data = [[], []];
        for (let i = 0; i < average_value.length; i++) {
            data[0].push({ axis: letiable.time_arr[i], value: aveScale(average_value[i]) })
        }
        console.log('data: ', data);






        //The radial line function
        let radarLine = d3.radialLine()
            .radius(function (d) { return rScale(d.value); })
            .angle(function (d, i) { return i * angleSlice; })
            .curve(d3.curveCardinalClosed)

        let radarArea = d3.areaRadial()
            .angle((d, i) => i * angleSlice)
            .innerRadius(d => rScale(d.inner))
            .outerRadius(d => rScale(d.outer))
            .curve(d3.curveCardinalClosed)
        if (cfg.roundStrokes) {
        }

        //Create a wrapper for the blobs
        console.log('area_letiance: ', area_letiance);
        let letianceArea = radarChart.radar_g.append("path")
            .attr("d", radarArea(area_letiance))
            .style("fill", '#FF9341')
            .style("fill-opacity", 0.5);

        let blobWrapper = radarChart.radar_g.selectAll(".radarWrapper")
            .data(data)
            .enter().append("g")
            .attr("class", "radarWrapper");

        //画线

        //Create the outlines	
        blobWrapper.append("path")
            .attr("class", "radarStroke")
            .attr("d", function (d, i) { return radarLine(d); })
            .style("stroke-width", cfg.strokeWidth + "px")
            .style("stroke", "#5aa3d6")
            .style("fill", "none")

        //Append the circles
        blobWrapper.selectAll(".radarCircle")
            .data(function (d, i) { return d; })
            .enter().append("circle")
            .attr("class", "radarCircle")
            .attr("r", cfg.dotRadius)
            .attr("cx", function (d, i) { return rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2); })
            .attr("cy", function (d, i) { return rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2); })
            .style("fill", "#5aa3d6")
            .style("fill-opacity", 0.8);

        /////////////////////////////////////////////////////////
        //////// Append invisible circles for tooltip ///////////
        /////////////////////////////////////////////////////////

        //Wrapper for the invisible circles on top
        let blobCircleWrapper = radarChart.radar_g.selectAll(".radarCircleWrapper")
            .data(data)
            .enter().append("g")
            .attr("class", "radarCircleWrapper");

        //Append a set of invisible circles on top for the mouseover pop-up
        blobCircleWrapper.selectAll(".radarInvisibleCircle")
            .data(function (d, i) { return d; })
            .enter().append("circle")
            .attr("class", "radarInvisibleCircle")
            .attr("r", cfg.dotRadius * 1.5)
            .attr("cx", function (d, i) { return rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2); })
            .attr("cy", function (d, i) { return rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2); })
            .style("fill", "none")
            .style("pointer-events", "all")
            .on("mouseover", function (d, i) {
                newX = parseFloat(d3.select(this).attr('cx')) - 10;
                newY = parseFloat(d3.select(this).attr('cy')) - 10;

                tooltip
                    .attr('x', newX)
                    .attr('y', newY)
                    .text(Format(d.value))
                    .transition().duration(200)
                    .style('opacity', 1);
            })
            .on("mouseout", function () {
                tooltip.transition().duration(200)
                    .style("opacity", 0);
            });

        //Set up the small tooltip for when you hover over a circle
        let tooltip = radarChart.radar_g.append("text")
            .attr("class", "tooltip")
            .style("opacity", 0);
    }
    return {
        draw,
        radar_g
    }
})()
