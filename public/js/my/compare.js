let AttrValue = (function () {

    d3.csv('data/index_id_infor.csv', function (data_infor) {
        console.log('data_infor: ', data_infor);
        d3.csv('data/year_id.csv', function (data_id) {
            console.log('data_id: ', data_id);
            d3.csv('data/year_p.csv', function (data_pos) {
                console.log('data_pos: ', data_pos);
                let svg_force = d3.select('#svg_force');

                let year_list = [];
                let year_dict = {};
                for (let i = 0; i < data_infor.length; i++) {
                    year_dict[data_infor[i]['INDEX']] = data_infor[i]['PY']
                    if (year_list.indexOf(data_infor[i]['PY']) == -1)
                        year_list.push(data_infor[i]['PY'])
                }

                
                let a = d3.rgb(0, 0, 255);	//红色
                let b = d3.rgb(255, 0, 0);	//绿色

                let compute = d3.interpolate(a, b);
                let yearScale = d3.scaleLinear().domain([1995, 2016]).range([0,1]);


                // let color = d3.scaleOrdinal(d3.schemeCategory20);
                // let color_list = [];


                //画坐标轴
                let svg_axis = d3.select("#svg_axis")
                let max_y = d3.max(data_pos, function (d) {
                    return parseFloat(d.y);
                });
                let max_x = d3.max(data_pos, function (d) {
                    return parseFloat(d.x);
                });
                let min_x = d3.min(data_pos, function (d) {
                    return parseFloat(d.x);
                });
                let min_y = d3.min(data_pos, function (d) {
                    return parseFloat(d.y);
                });

                let xScale = d3.scaleLinear().domain([min_x, max_x]).range([0, 600]);
                let yScale = d3.scaleLinear().domain([min_y, max_y]).range([600, 0]);

                let x_axis = d3.axisBottom(xScale).tickPadding(5).tickSize(3);
                let y_axis = d3.axisLeft(yScale).tickPadding(5).tickSize(3);

                svg_axis.append('g')
                    .attr("class", "axis")
                    .attr("transform", "translate(40,40)")
                    .call(y_axis)
                    .attr("id", "Yaxis")
                svg_axis.append('g')
                    .attr("class", "axis")
                    .attr("transform", "translate(40,640)")
                    .call(x_axis)
                svg_axis.append('g').selectAll('circle').data(data_pos).enter()
                    .append('circle')
                    .attr('cx', function (d) {
                        return xScale(parseFloat(d.x)) + 40;
                    }).attr('cy', function (d) {
                        return yScale(parseFloat(d.y)) + 40;
                    }).attr('r', 2)
                    .attr('fill', function (d, i) {
                        return compute(yearScale(parseInt(year_dict[data_id[i]['id']])));
                    }).on('click', function (d) {
                        console.log(d);
                    })
            })
        })
    })

    return {

    }
})()