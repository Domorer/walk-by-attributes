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
        let min_x = d3.min(comb_data, function (d) {
            return d.x
        });
        let min_y = d3.min(comb_data, function (d) {
            return d.y
        });
        let max_x = d3.max(comb_data, function (d) {
            return d.x
        });
        let max_y = d3.max(comb_data, function (d) {
            return d.y
        });
        let xScale = d3.scaleLinear().domain([min_x, max_x]).range([0, svg_width]);
        let yScale = d3.scaleLinear().domain([min_y, max_y]).range([svg_height, 0]);

        // let color = { 'VAST': 'red', 'InfoVis': '#76FF6E', 'SciVis': 'gray' };
        let color = d3.scaleOrdinal(d3.schemeCategory20);
        variable.svg_scatter.append('g').selectAll('circle').data(comb_data).enter()
            .append('circle')
            .attr('cx', function (d) {
                return xScale(parseFloat(d.x));
            }).attr('cy', function (d) {
                return yScale(parseFloat(d.y));
            }).attr('r', function () {
                if (variable.dataset == 'patent')
                    return 1.5
                else
                    return 2
            })
            .attr('fill', function (d, i) {
                d.cluster = variable.cluster_dict[d.id].cluster;
                // return color(variable.cluster_dict[d.id].index)
                return '#329CCB';
            }).on('click', function (d) {
                // console.log(d);
            }).attr('class', function (d) {
                return d.cluster;
            }).attr('id', function (d) {
                return 'scatter_' + d.id;
            })
        //绘制簇边界  
        let cluster_point_dict = {}; //保存每个簇的边界点坐标
        let cluster_ids_dict = {}; //保存每个簇内点的id
        for (let i = 0; i < comb_data.length; i++) {
            if (comb_data[i].cluster != -1) {
                let tmp_cluster = 'cluster-' + comb_data[i]['cluster'];
                if (cluster_point_dict[tmp_cluster]) {
                    cluster_ids_dict[tmp_cluster].push(comb_data[i]['id']);
                    cluster_point_dict[tmp_cluster].push([comb_data[i].x, comb_data[i].y])
                } else {
                    cluster_ids_dict[tmp_cluster] = [comb_data[i]['id']];
                    cluster_point_dict[tmp_cluster] = [
                        [comb_data[i].x, comb_data[i].y]
                    ]
                }
            }

        }
        let key_list = Object.keys(cluster_point_dict).sort(function (a, b) {
            return cluster_point_dict[b].length - cluster_point_dict[a].length
        })
        //定义线生成器
        let line = d3.line()
            .x(function (d) {
                return xScale(parseFloat(d[0]));
            })
            .y(function (d) {
                return yScale(parseFloat(d[1]));
            })
            .curve(d3.curveCatmullRom)
        let points_arr = [];
        let length_arr = [];
        for (let key in key_list) {
            let tmp_points = cluster_point_dict[key_list[key]];
            //获取边界点
            let areaPoints = hull(tmp_points, 10);
            points_arr.push(areaPoints);
            length_arr.push(areaPoints.length)
        }
        variable.svg_scatter.append('g').attr('id', 'scatter_g')
            .selectAll('path').data(points_arr).enter()
            .append('path')
            .attr('d', line)
            .attr('fill', '#D5E2FF')
            .attr('stroke', 'blue')
            .attr('stroke-width', 1)
            .attr('opacity', 0.2)
            .attr('id', function (d, i) {
                d.id = key_list[i];
                d.id = d.id.split('-').pop();
                return 'area_' + d.id;
            }).on('mouseover', function () {
                d3.select(this).attr('opacity', 0.5);
            }).on('mouseout', function () {
                d3.select(this).attr('opacity', 0.2);
            }).on('click', function (d, i) {
                const a = i;
                parallel.changeWidth(d.id)

                d3.select('#svg_parallel').select('#parallel_path_g').selectAll('path')
                    .style('opacity', function () {
                        return 0
                    })
                    .style('stroke', '#e3e3e3')
                d3.select('#area_' + variable.last_cluster).attr('fill', '#D5E2FF');
                d3.select('#clusterOut_' + variable.last_cluster)
                    .style('stroke-opacity', 0)

                d3.selectAll('.parallelClass_' + d.id)
                    .style('opacity', 1)
                    .style('stroke', '#8a8a8a')
                d3.select('#area_' + d.id).attr('fill', '#E83A00');
                d3.select('#clusterOut_' + d.id)
                    .style('stroke-opacity', 1)
                /*如果innertopo为选中状态，则点击当前节点就会改变该节点和节点外圈扇形的透明度
                 */


                variable.last_cluster = d.id;

            });
        //设置刷子
        // var brush = d3.brush()
        //     .on("end", brushed);

        // function brushed() {
        // let selection = d3.event.selection;
        // let inner_paper = [];
        // comb_data.forEach(Element => {
        //     Element.x = parseFloat(Element.x);
        //     Element.y = parseFloat(Element.y);
        //     if ((xScale(Element.x) + 10) > selection[0][0] && (xScale(Element.x) + 10) < selection[1][0] && yScale(Element.y) > selection[0][1] && yScale(Element.y) < selection[1][1])
        //         inner_paper.push(variable.info_dict[Element.id]);
        // })
        // parameters.drawchart(inner_paper);
        // }
        // $("#brush").click(function () {
        //     variable.svg_scatter.append("a")
        //         .attr("class", "brush")
        //         .call(brush)
        //     variable.svg_scatter.selectAll('circle').on('click', function () {})
        //     variable.svg_scatter.selectAll('path')
        //         .attr('opacity', 0)
        //         .on('mouseover', function () {})
        //         .on('mouseout', function () {})
        //         .on('click', function () {})
        // })

        //设置选簇操作
        // $('#cluster').on('click', function () {
        //     variable.svg_scatter.selectAll("a").remove();
        //     variable.svg_scatter.selectAll('path')
        //         .attr('opacity', 0.2)
        //         .on('mouseover', function () {
        //             d3.select(this).attr('opacity', 0.5);
        //         }).on('mouseout', function () {
        //             d3.select(this).attr('opacity', 0.2);
        //         }).on('click', function (d) {
        //             if (variable.last_cluster != undefined) {
        //                 d3.select('#cluster_' + variable.last_cluster).attr('fill', '#329CCB');
        //                 d3.select('#area_' + variable.last_cluster).attr('fill', '#D5E2FF');
        //                 d3.select('#tree_' + variable.last_cluster).attr('fill', '#B6E9FF').attr('stroke', '#329CCB')
        //             }
        //             d3.select('#cluster_' + d.id).attr('fill', '#FF9519');
        //             d3.select('#area_' + d.id).attr('fill', '#FF9519');
        //             d3.select('#tree_' + d.id).attr('fill', '#FFC889').attr('stroke', '#FF9519')
        //             variable.last_cluster = d.id;
        //             // console.log(d.id)
        //             // parallel.drawParallel(d.id);
        //         });
        // })
        //设置选点按钮操作
        // $("#point").click(function () {
        //     variable.svg_scatter.selectAll("a").remove();
        // })
    }

    function drawHeat(data) {
        //删除上次绘图canvas
        d3.select('#scatter_canvas').select('canvas').remove();
        //坐标进行比例换算，将坐标为负的按比例放缩到正值
        let svg_width = $("#svg_scatter")[0].scrollWidth;
        let svg_height = $("#svg_scatter")[0].scrollHeight;
        let min_x = d3.min(data.info, function (d) {
            return d.x
        });
        let min_y = d3.min(data.info, function (d) {
            return d.y
        });
        let max_x = d3.max(data.info, function (d) {
            return d.x
        });
        let max_y = d3.max(data.info, function (d) {
            return d.y
        });
        let xScale = d3.scaleLinear().domain([min_x, max_x]).range([0, svg_width]);
        let yScale = d3.scaleLinear().domain([min_y, max_y]).range([svg_height, 0]);
        //计算距离的公式
        let distance = function (a, b) {
            return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
        }
        /*计算每个点的信息熵
            1.生成kd tree，并使用该算法来获取点在某半径范围内的所有点
            2.计算该点范围内所有点的信息熵作为该点的值
        */
        let points = [],
            max_val = -Infinity,
            point_radius = 20
        for (let i = 0; i < data.info.length; i++) {
            let point = {
                x: xScale(data.info[i].x),
                y: yScale(data.info[i].y),
                id: data.info[i].id,
                value: 1,
                radius: 7
            }
            points.push(point);
        }
        // 生成kd tree
        let kd_tree = new kdTree(points, distance, ['x', 'y'])

        for (let i = 0; i < points.length; i++) {
            let tmp_point_set = kd_tree.nearest({
                    x: points[i].x,
                    y: points[i].y
                }, points.length, point_radius),
                tmp_value = 0,
                selected_attrs = variable.attr.split('')
            for (let n = 0; n < selected_attrs.length; n++) {
                tmp_value += 1 / calEntropy(tmp_point_set, selected_attrs[n]);
            }
            tmp_value /= selected_attrs.length;
            if (tmp_value > max_val)
                max_val = tmp_value
            points[i].value = tmp_value
        }
        //将value为负无穷大的赋值为最大值的两倍
        let best_max = max_val * 1.5 //因为信息熵的为0时最好，但此时倒数为无穷，所以将其设置为已有值的10倍
        for (let i = 0; i < points.length; i++) {
            if (points[i].value == -Infinity)
                points[i].value = best_max
        }
        console.log("drawHeat -> points", points)
        console.log("drawHeat -> max_val", max_val)

        let heat_data = {
            data: points
        }
        let container = document.querySelector('#scatter_canvas');
        let heatmap = h337.create({
            container: container
        })
        heatmap.setData(heat_data).setDataMax(best_max);

        // d3.select('.heatmap-canvas').style('z-index', -1)
    }

    let calEntropy = function (points, attr) {
        //此处没有包含属性值个数为0的项，因为个数为0时，对结果没有任何影响
        let entropy = 0,
            valueProb_dict = {}
        for (let i = 0; i < points.length; i++) {
            let tmp_id = points[i][0].id,
                tmp_attrValue = variable.nodeInfo[tmp_id][attr]
            if ((tmp_attrValue in valueProb_dict) == false)
                valueProb_dict[tmp_attrValue] = 1
            else
                valueProb_dict[tmp_attrValue] += 1
        }
        for (let av in valueProb_dict) {
            let tmp_Prob = valueProb_dict[av] / points.length
            entropy += tmp_Prob * Math.log2(tmp_Prob)
        }
        return -entropy
    }

    return {
        drawScatter,
        drawHeat
    }
})()