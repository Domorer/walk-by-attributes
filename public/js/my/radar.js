let radarChart = (function () {
    let radar_g, cfg, radarCounts = 0;
    function draw() {
        let svgWidth = $('#svg_radar')[0].scrollWidth;
        let svgHeight = $('#svg_radar')[0].scrollHeight;
        let margin = { top: svgHeight * 0.1, left: svgWidth * 0.1, right: svgWidth * 0.1, bottom: svgHeight * 0.05 }
        ////////////////////////////////////////////////////////////// 
        ////////////////////////// Data ////////////////////////////// 
        ////////////////////////////////////////////////////////////// 
        
        let data = [[], []];
        for (let i = 0; i < 5; i++) {
            data[0].push({ axis: variable.time_arr[i], value: 0 })
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

        radarChart.cfg = {
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

        //Put all of the options into a variable called radarChart.cfg
        if ('undefined' !== typeof options) {
            for (let i in options) {
                if ('undefined' !== typeof options[i]) { radarChart.cfg[i] = options[i]; }
            }//for i
        }//if

        //If the supplied maxValue is smaller than the actual one, replace by the max in the data
        let maxValue = Math.max(radarChart.cfg.maxValue, d3.max(data, function (i) { return d3.max(i.map(function (o) { return o.value; })) }));

        let allAxis = (data[0].map(function (i, j) { return i.axis })),	//Names of each axis
            total = allAxis.length,					//The number of different axes
            radius = Math.min(radarChart.cfg.w / 2, radarChart.cfg.h / 2), 	//Radius of the outermost circle
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
            .attr("width", radarChart.cfg.w + radarChart.cfg.margin.left + radarChart.cfg.margin.right)
            .attr("height", radarChart.cfg.h + radarChart.cfg.margin.top + radarChart.cfg.margin.bottom)
            .attr("class", "radar" + id);
        //Append a g element		
        radarChart.radar_g = svg.append("g")
            .attr("transform", "translate(" + (radarChart.cfg.w / 2 + radarChart.cfg.margin.left) + "," + (radarChart.cfg.h / 2 + radarChart.cfg.margin.top) + ")");

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
            .data(d3.range(1, (radarChart.cfg.levels + 1)).reverse())
            .enter()
            .append("circle")
            .attr("class", "gridCircle")
            .attr("r", function (d, i) { return radius / radarChart.cfg.levels * d; })
            .style("fill", "#CDCDCD")
            .style("stroke", "#CDCDCD")
            .style("fill-opacity", radarChart.cfg.opacityCircles)
            .style("filter", "url(#glow)");

        //Text indicating at what % each level is
        axisGrid.selectAll(".axisLabel")
            .data(d3.range(1, (radarChart.cfg.levels + 1)).reverse())
            .enter().append("text")
            .attr("class", "axisLabel")
            .attr("x", 4)
            .attr("y", function (d) { return -d * radius / radarChart.cfg.levels; })
            .attr("dy", "0.4em")
            .style("font-size", "10px")
            .attr("fill", "#737373")
        // .text(function (d, i) { return Format(maxValue * d / radarChart.cfg.levels); });

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
            .style("stroke", (d, i) => variable.attr_color[i])
            .style("stroke-width", "4px");

        //Append the labels at each axis
        axis.append("text")
            .attr("class", "legend")
            .style("font-size", "11px")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("x", function (d, i) { return rScale(maxValue * radarChart.cfg.labelFactor) * Math.cos(angleSlice * i - Math.PI / 2); })
            .attr("y", function (d, i) { return rScale(maxValue * radarChart.cfg.labelFactor) * Math.sin(angleSlice * i - Math.PI / 2); })
            .text(function (d) { return d })
            .call(wrap, radarChart.cfg.wrapWidth);

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

    function addRadar(cluster) {
        //此时的每条线应该代表的是类内的一个点，点在每个属性上的值代表该点与类内点的连线轨迹的权重值和除于该点所有连线的权重之和
        //计算均值
        radarChart.radarCounts += 1
        let average_value = new Array(5).fill(0);
        let value_arr = [];
        let tmp_ids = variable.cluster_ids_dict[cluster]
        for (let i = 0; i < tmp_ids.length; i++) {
            let tmp_targets = variable.station_links_dict[tmp_ids[i]];
            let inner_value = new Array(5).fill(0), outer_value = new Array(5).fill(0);
            for (let j = 0; j < tmp_targets.length; j++) {
                let tmp_link_key = Math.min(parseInt(tmp_ids[i]), parseInt(tmp_targets[j])) + '_' + Math.max(parseInt(tmp_ids[i]), parseInt(tmp_targets[j]));
                if (tmp_ids.indexOf(tmp_targets[j]) != -1)
                    for (let a = 0; a < 5; a++)
                        inner_value[a] += variable.period_dict[tmp_link_key][a]
                if (tmp_ids.indexOf(tmp_targets[j]) == -1)
                    for (let a = 0; a < 5; a++)
                        outer_value[a] += variable.period_dict[tmp_link_key][a]
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
        let data = [];
        for (let i = 0; i < average_value.length; i++) {
            data.push({ axis: variable.time_arr[i], value: aveScale(average_value[i]) })
        }
        console.log('data: ', data);

        //If the supplied maxValue is smaller than the actual one, replace by the max in the data
        let maxValue = Math.max(radarChart.cfg.maxValue, d3.max(data, d => d.value));

        let allAxis = (data.map(function (i, j) { return i.axis })),	//Names of each axis
            total = allAxis.length,					//The number of different axes
            radius = Math.min(radarChart.cfg.w / 2, radarChart.cfg.h / 2), 	//Radius of the outermost circle
            angleSlice = Math.PI * 2 / total;		//The width in radians of each "slice"

        //Scale for the radius
        let rScale = d3.scaleLinear()
            .range([0, radius])
            .domain([0, maxValue]);





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


        //Create a wrapper for the blobs
        console.log('area_letiance: ', area_letiance);
        let OPScale = d3.scaleLinear().domain([0,radarChart.radarCounts]).range([0.1, 1])

        radarChart.radar_g.selectAll('.radarWrap').attr('opacity',(d,i)=>OPScale(i))
        let blobWrapper = radarChart.radar_g.append("g").attr('class', 'radarWrap')
        //方差区域线
        blobWrapper.append("path")
            .attr("d", radarArea(area_letiance))
            .style("fill", '#FF9341')
            .style("fill-opacity", 0.5);
        //画均值线
        blobWrapper.append("path")
            .attr("class", "radarStroke")
            .attr("d", radarLine(data))
            .style("stroke-width", radarChart.cfg.strokeWidth + "px")
            .style("stroke", "#5aa3d6")
            .style("fill", "none")

        //画均值线上的点
        blobWrapper.selectAll(".radarCircle")
            .data(data)
            .enter().append("circle")
            .attr("class", "radarCircle")
            .attr("r", radarChart.cfg.dotRadius)
            .attr("cx", function (d, i) { return rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2); })
            .attr("cy", function (d, i) { return rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2); })
            .style("fill", "#5aa3d6")
            .style("fill-opacity", 0.8);

    }
    return {
        draw,
        radar_g,
        addRadar,
        cfg,
        radarCounts
    }
})()
