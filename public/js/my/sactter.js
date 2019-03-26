let scatter = (function () {

    function drawScatter(comb_data) {
        console.log('comb_data: ', comb_data);
        variable.svg_scatter.selectAll('*').remove();
        let svg_width = $("#svg_scatter")[0].scrollWidth;
        let svg_height = $("#svg_scatter")[0].scrollHeight;

        comb_data.forEach(Element => {
            Element['x'] = parseFloat(Element['x']);
            Element['y'] = parseFloat(Element['y']);
        })
        let min_x = d3.min(comb_data, function (d) { return d.x });
        let min_y = d3.min(comb_data, function (d) { return d.y });
        let max_x = d3.max(comb_data, function (d) { return d.x });
        let max_y = d3.max(comb_data, function (d) { return d.y });
        let xScale = d3.scaleLinear().domain([min_x, max_x]).range([0, svg_width - 20]);
        let yScale = d3.scaleLinear().domain([min_y, max_y]).range([svg_height - 20, 0]);

        // let color = { 'VAST': 'red', 'InfoVis': '#76FF6E', 'SciVis': 'gray' };
        let color = d3.scaleOrdinal(d3.schemeCategory20);
        variable.svg_scatter.append('g').selectAll('circle').data(comb_data).enter()
            .append('circle')
            .attr('cx', function (d) {
                return xScale(parseFloat(d.x)) + 10;
            }).attr('cy', function (d) {
                return yScale(parseFloat(d.y));
            }).attr('r', 2)
            .attr('fill', function (d, i) {
                d.cluster = variable.cluster_dict[d.id].cluster;
                // return color(variable.cluster_dict[d.id].index)
                return '#329CCB';
            }).on('click', function (d) {
                console.log(d);
            }).attr('class', function (d) {
                return d.cluster;
            }).attr('id', function (d) {
                return d.id;
            })
        //绘制簇边界  
        let cluster_point_dict = {};//保存每个簇的边界点坐标
        let cluster_ids_dict = {};//保存每个簇内点的id
        for (let i = 0; i < comb_data.length; i++) {
            if (comb_data[i].cluster != -1) {
                let tmp_cluster = 'cluster-' + comb_data[i]['cluster'];
                if (cluster_point_dict[tmp_cluster]) {
                    cluster_ids_dict[tmp_cluster].push(comb_data[i]['id']);
                    cluster_point_dict[tmp_cluster].push([comb_data[i].x, comb_data[i].y])
                }
                else {
                    cluster_ids_dict[tmp_cluster] = [comb_data[i]['id']];
                    cluster_point_dict[tmp_cluster] = [[comb_data[i].x, comb_data[i].y]]
                }
            }

        }
        let key_list = Object.keys(cluster_point_dict).sort(function (a, b) { return cluster_point_dict[b].length - cluster_point_dict[a].length })
        //定义线生成器
        let line = d3.line()
            .x(function (d) { return xScale(parseFloat(d[0])) + 10; })
            .y(function (d) { return yScale(parseFloat(d[1])); })
        // .curve(d3.curveCardinalClosed)
        let points_arr = [];
        let length_arr = [];
        for (let key in key_list) {
            let tmp_points = cluster_point_dict[key_list[key]];
            let areaPoints = hull(tmp_points, 10);
            points_arr.push(areaPoints);
            length_arr.push(areaPoints.length)
        }
        variable.svg_scatter.append('g').selectAll('path').data(points_arr).enter()
            .append('path')
            .attr('d', line)
            .attr('fill', '#D5E2FF')
            .attr('stroke', 'blue')
            .attr('stroke-width', 1)
            .attr('opacity', 0)
            .attr('id', function (d, i) {
                d.id = key_list[i];
                d.id = d.id.split('-').pop();
                return 'area_' + d.id;
            });
        //设置刷子
        var brush = d3.brush()
            .on("end", brushed);
        function brushed() {
            // let selection = d3.event.selection;
            // let inner_paper = [];
            // comb_data.forEach(Element => {
            //     Element.x = parseFloat(Element.x);
            //     Element.y = parseFloat(Element.y);
            //     if ((xScale(Element.x) + 10) > selection[0][0] && (xScale(Element.x) + 10) < selection[1][0] && yScale(Element.y) > selection[0][1] && yScale(Element.y) < selection[1][1])
            //         inner_paper.push(variable.info_dict[Element.id]);
            // })
            // parameters.drawchart(inner_paper);
        }
        $("#brush").click(function () {
            variable.svg_scatter.append("a")
                .attr("class", "brush")
                .call(brush)
            variable.svg_scatter.selectAll('circle').on('click', function () { })
            variable.svg_scatter.selectAll('path')
                .attr('opacity', 0)
                .on('mouseover', function () { })
                .on('mouseout', function () { })
                .on('click', function () { })
        })

        //设置选簇操作
        $('#cluster').on('click', function () {
            variable.svg_scatter.selectAll("a").remove();
            variable.svg_scatter.selectAll('path')
                .attr('opacity', 0.2)
                .on('mouseover', function () {
                    d3.select(this).attr('opacity', 0.5);
                }).on('mouseout', function () {
                    d3.select(this).attr('opacity', 0.2);
                }).on('click', function (d) {
                    if (variable.last_cluster != undefined) {
                        d3.select('#cluster_' + variable.last_cluster).attr('fill', '#329CCB');
                        d3.select('#area_' + variable.last_cluster).attr('fill', '#D5E2FF');
                        d3.select('#tree_' + variable.last_cluster).attr('fill', '#B6E9FF').attr('stroke', '#329CCB')
                    }
                    d3.select('#cluster_' + d.id).attr('fill', '#FF9519');
                    d3.select('#area_' + d.id).attr('fill', '#FF9519');
                    d3.select('#tree_' + d.id).attr('fill', '#FFC889').attr('stroke', '#FF9519')
                    variable.last_cluster = d.id;
                    console.log(d.id)
                    parallel.drawParallel(d.id);
                });
        })
        //设置选点按钮操作
        // $("#point").click(function () {
        //     variable.svg_scatter.selectAll("a").remove();
        // })

    }


    return {
        drawScatter
    }
})()