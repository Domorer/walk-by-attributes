let forceChart = (function () {
    let forceWidth = $('#svg_force')[0].scrollWidth;
    let forceHeight = $('#svg_force')[0].scrollHeight;
    let cluster_nodes, bundling_edge;
    variable.viewbox.right = forceWidth,
        variable.viewbox.bottom = forceHeight;
    //设置边绑定按钮
    $('#edge_bundling').on('click', () => {
        forceChart.edgeBundling(forceChart.cluster_nodes, forceChart.bundling_edge, variable.clusterLink_weight_dict)
    })
    //svg 拖曳


    let dragSvg = () => {

        function dragstarted(d) {
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(d) {
            d.fx = null;
            d.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }
    variable.svg_force.call(dragSvg())

    function drawStaticForce(nodes, links, cluster_dict) {
        let color = d3.scaleOrdinal(d3.schemeCategory20);
        variable.svg_force.selectAll('*').remove();
        //绘制节点
        let node = variable.svg_force.append('g').selectAll('circle').data(nodes).enter()
            .append('circle')
            .attr('r', 2)
            .attr('cx', function (d) {
                return d.x;
            })
            .attr('cy', function (d) {
                return d.y;
            })
            .attr('stroke', function (d) {
                d.cluster = cluster_dict[d.id];
                if (d.cluster != -1 && d.cluster != undefined)
                    return color(d.cluster)
                else
                    return 'black';
            }).attr('fill', function (d) {
                if (d.cluster != -1 && d.cluster != undefined)
                    return color(d.cluster)
                else
                    return 'black';
            }).attr('class', function (d) {
                return d.id;
            });

        let line = d3.line()
            .x(function (d) {
                return d[0]
            })
            .y(function (d) {
                return d[1]
            })
        let link = variable.svg_force.append('g').selectAll('path').data(links).enter()
            .append('path')
            .attr('d', function (d) {
                return line(d.loc)
            })
            .attr('stroke', function (d) {
                let s_cluster = cluster_dict[d.source];
                let t_cluster = cluster_dict[d.target];
                if (s_cluster === t_cluster)
                    return color(parseInt(s_cluster));
                else
                    return 'gray';
            }).attr('stroke-width', 1)
            .attr('opacity', 0.1)
            .attr('class', function (d) {
                return d.source + '_' + d.target;
            })

    }

    function drawOriForce(nodes, links, cluster_dict) {
        let color = d3.scaleOrdinal(d3.schemeCategory20);
        let forceWidth = $('#svg_force')[0].scrollWidth;
        let forceHeight = $('#svg_force')[0].scrollHeight;
        variable.svg_force.selectAll('*').remove();
        color_dict = {
            'VAST': 0,
            'InfoVis': 1,
            'SciVis': 2
        }

        //设置力的作用
        let simulation = d3.forceSimulation(nodes)
            .force("charge", d3.forceManyBody().strength(-3500).distanceMax(50))
            .force("link", d3.forceLink(links).id(d => d.id))
            .force("center", d3.forceCenter(forceWidth / 2, forceHeight / 2))
        //设置tick函数
        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);

        });
        let drag = simulation => {

            function dragstarted(d) {
                if (!d3.event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            }

            function dragged(d) {
                d.fx = d3.event.x;
                d.fy = d3.event.y;
            }

            function dragended(d) {
                if (!d3.event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }

            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        }



        // 画线
        let link = variable.svg_force.append('g').selectAll('line').data(links).enter()
            .append('line')
            .attr('stroke', function (d) {
                // if (d.source.id === d.target.id)
                //     return color(d.target.id);
                // else
                return 'gray';
            }).attr('stroke-width', function (d) {
                return 1;
            })
            .attr('opacity', function (d) {
                return 1;
            })
            .attr('class', 'oriForce_link')
            .attr('id', function (d) {
                return d.source + '_' + d.target;
            })

        //绘制节点
        let node = variable.svg_force.append('g').selectAll('circle').data(nodes).enter()
            .append('circle')
            .attr('r', 5)
            .attr('cx', function (d) {
                return d.x;
            })
            .attr('cy', function (d) {
                return d.y;
            })
            .attr('stroke', function (d) {
                // d.cluster = cluster_dict[d.id];
                // if (d.cluster != -1 && d.cluster != undefined)
                //     return color(d.cluster)
                // else
                let tmp_index = variable.attrValue_dict[variable.attr].indexOf(d[parseInt(variable.attr)])
                return variable.valueColor_dict[variable.dataset][variable.attr][tmp_index]
            }).attr('fill', function (d) {
                // if (d.cluster != -1 && d.cluster != undefined)
                //     return color(d.cluster)
                // else
                let tmp_index = variable.attrValue_dict[variable.attr].indexOf(d[parseInt(variable.attr)])
                return variable.valueColor_dict[variable.dataset][variable.attr][tmp_index]
            }).attr('class', function (d) {
                return d.id;
            }).call(drag(simulation));
    }



    //绘制簇内点的原始力引导图
    function drawClusterForce(cluster, radius, center_x, center_y) {

        // variable.selectAll('').remove();
        let nodes = [],
            nodes_dict = {},
            links = variable.clu_tpg[cluster];

        // for (let i = 0; i < variable.cluster_ids_dict[cluster].length; i++) {
        //     let tmp_id = variable.cluster_ids_dict[cluster][i]
        //     let tmp_node = {
        //         'id': tmp_id,
        //     }
        //     nodes.push(tmp_node)
        // }
        for (let i = 0; i < links.length; i++) {
            if (nodes_dict[links[i].source] == undefined)
                nodes_dict[links[i].source] = true;
            if (nodes_dict[links[i].target] == undefined)
                nodes_dict[links[i].target] = true;
        }
        for (let key in nodes_dict) {
            nodes.push({
                'id': key
            });
        }

        let simulation_cluster = d3.forceSimulation(nodes)
            .force("charge", d3.forceManyBody().distanceMax(10))
            .force("link", d3.forceLink(links).id(d => d.id))
            .force("center", d3.forceCenter(center_x, center_y))
        let drag_cluster = simulation_cluster => {

            function dragstarted(d) {
                if (!d3.event.active) simulation_cluster.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            }

            function dragged(d) {
                d.fx = d3.event.x;
                d.fy = d3.event.y;
            }

            function dragended(d) {
                if (!d3.event.active) simulation_cluster.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }

            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        }

        //设置tick函数
        simulation_cluster.on("tick", () => {
            link_cluster
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node_cluster
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
        })
        //画线
        let color = d3.scaleOrdinal(d3.schemeCategory20);

        let link_cluster = variable.svg_force.append('g').selectAll('line').data(links).enter()
            .append('line')
            .attr('stroke', '#bfbfbf')
            .attr('opacity', 0.4)
            .attr('stroke-width', 2)
            .attr('class', 'innerTopoLinks_' + cluster)
        //画点
        let node_cluster = variable.svg_force.append('g').selectAll('circle').data(nodes).enter()
            .append('circle')
            .attr('r', 2)
            .attr('stroke', function (d) {
                if (variable.type_count == 1)
                    return variable.valueColor_dict[variable.dataset][variable.attr][variable.attrValue_dict[variable.attr].indexOf(variable.nodeInfo[d.id][parseInt(variable.attr)])]
                else
                    return '#53aad5'
            })
            .attr('fill', function (d) {
                if (variable.type_count == 1) {
                    let tmp_idnex = variable.attrValue_dict[variable.attr].indexOf(variable.nodeInfo[d.id][parseInt(variable.attr)])
                    return variable.valueColor_dict[variable.dataset][variable.attr][tmp_idnex]
                } else
                    return '#53aad5'
            })
            .attr('class', 'innerTopoNodes_' + cluster)
            .call(drag_cluster(simulation_cluster));
    }


    //************绘制聚类后的力引导图************

    function Clustering(clusterids_dict, clusterLinks_dict, cluster_dict) {
        variable.svg_force.selectAll('*').remove();
        // variable.svg_force.attr('viewBox', '-200 -200 1000 1000')
        //直接只画类的点，不画类内的点
        let cluster_links = [],
            cluster_nodes = [];
        let r_extent = [],
            lineW_extent = [];
        let color = d3.scaleOrdinal(d3.schemeCategory20);

        /*********统计每个簇内的点数量, 赋值给value    
                半径映射点的数量
                颜色深浅映射密度
        */
        for (let key in clusterids_dict) {
            let tmp_dict = {};
            tmp_dict['id'] = key;
            tmp_dict['value'] = parseInt(clusterids_dict[key].length);
            tmp_dict['density'] = (2 * variable.clu_tpg[key].length) /
                (clusterids_dict[key].length * (clusterids_dict[key].length - 1))
            cluster_nodes.push(tmp_dict);
        }

        let index_dict = {};
        for (let i = 0; i < cluster_nodes.length; i++) {
            index_dict[cluster_nodes[i].id] = i;
        }
        //设置半径的比例尺
        r_extent = d3.extent(cluster_nodes, function (d) {
            return d.value;
        })
        d_extent = d3.extent(cluster_nodes, function (d) {
            return d.density;
        })
        let dScale = d3.scaleLinear().domain(d_extent).range([0, 1])
        let colorDensity = d3.interpolateRgb('#a4b9ff', '#0740ff')
        let rScale = d3.scaleLinear().domain(r_extent).range([5, 20]);
        //***********统计每条连线的权重************

        let bundling_edge = [];
        for (let key in clusterLinks_dict) {
            if (key.split('-')[0] != key.split('-')[1]) {
                let tmp_dict = {};
                tmp_dict['source'] = key.split('-')[0];
                tmp_dict['target'] = key.split('-')[1];
                tmp_dict['value'] = parseInt(clusterLinks_dict[key]);
                cluster_links.push(tmp_dict);
                let tmp_bundling = {};
                tmp_bundling['source'] = index_dict[key.split('-')[0]];
                tmp_bundling['target'] = index_dict[key.split('-')[1]];
                tmp_bundling['weight'] = parseInt(clusterLinks_dict[key]);
                bundling_edge.push(tmp_bundling);
            }
        }
        //******设置线宽的比例尺**********
        lineW_extent = d3.extent(cluster_links, function (d) {
            return d.value;
        })

        let LWScale = d3.scaleLinear().domain(lineW_extent).range([1, 6]);
        let OPScale = d3.scaleLinear().domain(lineW_extent).range([0.5, 1]);
        let index = 0;
        while (index < cluster_links.length) {
            if (LWScale(cluster_links[index].value) < 1.5) {
                bundling_edge.splice(index, 1)
                cluster_links.splice(index, 1)
            } else
                index += 1;
        }
        //更新边绑定数据
        forceChart.bundling_edge = bundling_edge;
        forceChart.cluster_nodes = cluster_nodes;

        //设置力的作用
        let simulation = d3.forceSimulation(cluster_nodes)
            .force("charge", d3.forceManyBody().strength(-3500).distanceMax(200))
            .force("link", d3.forceLink(cluster_links).id(d => d.id))
            .force("center", d3.forceCenter(forceWidth / 2, forceHeight / 2))

        let drag = simulation => {

            function dragstarted(d) {
                if (!d3.event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            }

            function dragged(d) {
                d.fx = d3.event.x;
                d.fy = d3.event.y;
            }

            function dragended(d) {
                if (!d3.event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }

            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        }



        //画线
        let link = variable.svg_force.append('g').selectAll('line').data(cluster_links).enter()
            .append('line')
            .attr('stroke', function (d) {
                return '#c5c5c5';
            }).attr('stroke-width', function (d) {
                return LWScale(d.value);
            })
            .attr('opacity', function (d) {
                return OPScale(d.value);
            })
            .attr('class', 'force_link')
            .attr('id', function (d) {
                return d.source + '_' + d.target;
            })
        //最外层大圆环

        let nodeOut = variable.svg_force.append('g').attr('class', 'node')
            .selectAll('circle')
            .data(cluster_nodes)
            .enter()
            .append('circle')
            .attr('r', function (d) {
                return rScale(d.value) * 2.5;
            })
            .style('fill', 'white')
            .style('fill-opacity', 0)
            .style('stroke', 'red')
            .style('stroke-opacity', 0)
            .style('stroke-width', 2)
            .attr('class', function (d) {
                return 'clusterOut_node';
            }).attr('id', d => 'clusterOut_' + d.id)

        //背景白圆

        let nodeBack = variable.svg_force.append('g').attr('class', 'node')
            .selectAll('circle')
            .data(cluster_nodes)
            .enter()
            .append('circle')
            .attr('r', function (d) {
                return rScale(d.value);
            })
            .style('fill', 'white')
            .style('stroke', 'black')
            .style('stroke-width', 1)
            .attr('class', function (d) {
                return 'clusterBack_node';
            }).attr('id', d => 'clusterBack_' + d.id)

        //实心点
        let node = variable.svg_force.append('g').attr('class', 'node').selectAll('circle').data(cluster_nodes).enter()
            .append('circle')
            .attr('r', function (d) {
                return rScale(d.value) * 3 / 5;
            })
            .attr('stroke', function (d) {
                return colorDensity(dScale(d.density));
            }).attr('fill', function (d) {
                return colorDensity(dScale(d.density));
            }).attr('class', function (d) {
                return 'cluster_node';
            }).attr('id', d => 'cluster_' + d.id)
            .on('click', function (d, i) {
                const a = i;
                parallel.changeWidth(d.id)

                d3.select('#svg_parallel').selectAll('path')
                    .style('opacity', function () {
                        if (variable.dataset == 'patent')
                            return 0
                        else
                        return .05
                    })
                    .style('stroke-width', 1)
                    .style('stroke', '#e3e3e3')
                d3.select('#area_' + variable.last_cluster).attr('fill', '#D5E2FF');
                d3.select('#clusterOut_' + variable.last_cluster)
                    .style('stroke-opacity', 0)

                d3.selectAll('.parallelClass_' + d.id)
                    .style('opacity', 1)
                    .style('stroke-width', 2)
                    .style('stroke', '#8a8a8a')
                d3.select('#area_' + d.id).attr('fill', '#E83A00');
                d3.select('#clusterOut_' + d.id)
                    .style('stroke-opacity', 1)
                /*如果innertopo为选中状态，则点击当前节点就会改变该节点和节点外圈扇形的透明度
                
                */
                if ($('#topo')[0].checked) {
                    if ($(this)[0].style.opacity == '0') {
                        d3.selectAll('.pie_' + d.id).style('opacity', 1);
                        d3.select(this).style('opacity', 1);
                    } else {
                        d3.selectAll('.pie_' + d.id).style('opacity', 0);
                        d3.select(this).style('opacity', 0);
                        drawClusterForce(d.id, rScale(d.value), d.x, d.y);
                        d3.select('#clusterOut_' + d.id)
                            .style('stroke-opacity', .2)
                    }
                }

                variable.last_cluster = d.id;

                //雷达图
                // radarChart.addRadar(d.id);

                //平行坐标轴
                // parallel.drawParallel(d.id);
                // forceChart.drawPie(d.id);
            }).call(drag(simulation))




        //画园内的pattern
        //加权随机
        function randomW(wArr) {
            let sum = 0;
            for (let i = 0; i < wArr.length; i++)
                sum += wArr[i]
            let randomNum = Math.random() * sum;
            let tmp = 0
            for (let i = 0; i < wArr.length; i++) {
                tmp += wArr[i]
                if (tmp >= randomNum)
                    return i;
            }
        }
        let pattern_g = [],
            pieArr = [];
        let wtPattern = [0, 2, 7, 2, 1]
        for (let i = 0; i < cluster_nodes.length; i++) {
            let pie_g = drawPie(cluster_nodes[i].id, rScale(cluster_nodes[i].value));
            // let tmp_g = drawTopo(randomW(wtPattern), rScale(cluster_nodes[i].value));
            // pattern_g.push({
            //     node: tmp_g[0],
            //     link: tmp_g[1],
            //     value: cluster_nodes[i].value
            // });
            pieArr.push(pie_g);
        }
        //画圆外的属性方差值
        // for()

        // let radian_dict = {
        //     'left_top': 162 * (2 * Math.PI / 360),
        //     'left_bottom': 234 * (2 * Math.PI / 360),
        //     'right_top': 18 * (2 * Math.PI / 360),
        //     'right_bottom': 308 * (2 * Math.PI / 360)
        // }

        //设置tick函数
        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
            nodeOut
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
            nodeBack
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
            for (let i = 0; i < pieArr.length; i++) {
                // pattern_g[i].node.attr('transform', "translate(" + cluster_nodes[i].x + ',' + cluster_nodes[i].y + ')');
                // pattern_g[i].link.attr('transform', "translate(" + cluster_nodes[i].x + ',' + cluster_nodes[i].y + ')');
                pieArr[i].attr('transform', "translate(" + cluster_nodes[i].x + ',' + cluster_nodes[i].y + ')');
            }

        });



    }

    //***************边邦定***************
    function edgeBundling(cluster_nodes, bundling_edge, clusterLinks_dict) {

        d3.selectAll('.force_link').remove();

        //***********布局稳定后进行边邦定************
        var fbundling = d3.ForceEdgeBundling()
            .nodes(cluster_nodes)
            .edges(bundling_edge);
        var results = fbundling();

        for (let i = 0; i < results.length; i++) {
            let tmp_key = results[i][0].id + '-' + results[i][results[i].length - 1].id
            results[i].value = clusterLinks_dict[tmp_key]
        }

        let lineW_extent = d3.extent(results, function (d) {
            return d.value;
        })
        let OPScale = d3.scaleLinear().domain(lineW_extent).range([0.2, 0.8]);
        let LWScale = d3.scaleLinear().domain(lineW_extent).range([1, 6]);


        var d3line = d3.line()
            .x(d => d.x)
            .y(d => d.y)
            .curve(d3.curveBundle)

        variable.svg_force.insert("g", '.node').selectAll('path').data(results).enter()
            .append('path')
            .attr("d", d => d3line(d))
            .attr("stroke-width", d => LWScale(d.value))
            .attr("stroke", "#c5c5c5")
            .attr("fill", "none")
            .attr('stroke-opacity', d => OPScale(d.value));
    }



    //画圆外的扇形,单个园
    function drawPie(cluster, radius) {
        //判断是单属性还是多属性
        let attrs_value = new Array(),
            tmp_color_arr,
            tmp_attr_arr
        if (variable.type_count == 1) {
            tmp_color_arr = variable.valueColor_dict[variable.dataset][variable.attr]
            //单属性时，variable.attr 就是属性名称，不是多个属性名称的集合
            let value_dict = {};
            for (let i = 0; i < variable.attrValue_dict[variable.attr].length; i++) {
                value_dict[variable.attrValue_dict[variable.attr][i]] = 0
            }
            //遍历当前类内的点，并统计各个属性值都包含几个点
            let tmp_ids = variable.cluster_ids_dict[cluster];

            for (let i = 0; i < tmp_ids.length; i++) {
                let tmp_value = variable.nodeInfo[tmp_ids[i]][variable.attr];
                value_dict[tmp_value] += 1;
            }
            for (let key in value_dict) {
                // console.log(key)
                attrs_value.push(value_dict[key]);
            }

        } else {
            //计算每种属性的信息熵
            tmp_color_arr = variable.attr_color
            tmp_attr_arr = variable.attr.split('')
            for (let i = 0; i < variable.type_count; i++) {
                let tmpEntropy = calEntropy(cluster, tmp_attr_arr[i], variable.cluster_ids_dict)
                if (tmpEntropy == 0)
                    attrs_value.push(10000000)
                else
                    attrs_value.push(1 / tmpEntropy)
            }
        }

        let rScale = d3.scaleLinear()
            .domain(d3.extent(attrs_value))
            .range([radius * 1.2, radius * 2.3])
        let color = d3.scaleOrdinal(d3.schemeCategory20);


        let pie_data = d3.pie()(attrs_value)
        for (let i = 0; i < pie_data.length; i++) {
            pie_data[i].startAngle = i * Math.PI * 2 / pie_data.length;
            pie_data[i].endAngle = (i + .9) * Math.PI * 2 / pie_data.length;
            pie_data[i].innerRadius = radius;
            pie_data[i].outerRadius = rScale(pie_data[i].data);
            pie_data[i].class = 'pie_' + cluster;
        }
        // let r_scale = 


        let arc = d3.arc()
            .innerRadius(radius)
            .outerRadius(d => rScale(d.data))
            .cornerRadius(d => (d.outerRadius - d.innerRadius) / 5)

        let pie_g = variable.svg_force.append('g').selectAll('path').data(pie_data).enter()
            .append('path')
            .attr('d', d => arc(d))
            .attr('fill', function (d, i) {
                if (variable.type_count != 1) {
                    return tmp_color_arr[parseInt(tmp_attr_arr[i]) - 1]
                }

                return tmp_color_arr[i];
            })
            .attr('stroke', function (d, i) {
                if (variable.type_count != 1)
                    return tmp_color_arr[parseInt(tmp_attr_arr[i]) - 1]
                return tmp_color_arr[i];
            })
            .attr('stroke-width', 0.1)
            .attr('class', d => d.class)
            .on('click', function (d, i) {
                console.log(i)
            })
        return pie_g;
    }



    //计算一个类的给定属性的信息熵
    function calEntropy(cluster, attr, clu_ids_dict) {
        let entropy = 0,
            valueProb_dict = {}
        for (let i = 0; i < clu_ids_dict[cluster].length; i++) {
            let tmp_id = clu_ids_dict[cluster][i],
                tmp_attrValue = variable.nodeInfo[tmp_id][attr]
            if ((tmp_attrValue in valueProb_dict) == false)
                valueProb_dict[tmp_attrValue] = 1
            else
                valueProb_dict[tmp_attrValue] += 1
        }
        for (let av in valueProb_dict) {
            let tmp_Prob = valueProb_dict[av] / clu_ids_dict[cluster].length
            entropy += tmp_Prob * Math.log2(tmp_Prob)
        }
        return -entropy
    }

    function calVariance(link_arr) {
        let varianceArr = new Array(5).fill(0),
            ave_arr = new Array(5).fill(0);
        for (let i = 0; i < link_arr.length; i++) {
            for (let j = 0; j < 5; j++)
                ave_arr[j] += link_arr[i].value[j] / link_arr.length;
        }
        for (let i = 0; i < link_arr.length; i++) {
            for (let j = 0; j < 5; j++) {
                varianceArr[j] += Math.pow(ave_arr[j] - link_arr[i].value[j], 2) / link_arr.length;
            }
        }
        return varianceArr;
    }

    //画节点内部的图案
    function drawTopo(topo_type, radius) {
        let topo_nodes = [],
            topo_links = [];
        let radian_dict = {
            'left_top': 162 * (2 * Math.PI / 360),
            'left_bottom': 234 * (2 * Math.PI / 360),
            'right_bottom': 308 * (2 * Math.PI / 360),
            'right_top': 18 * (2 * Math.PI / 360)
        }
        if (topo_type == 0) {
            //*************环***************
            topo_nodes.push({
                x: 0,
                y: -2 * radius / 3
            });
            for (let key in radian_dict) {
                topo_nodes.push({
                    x: Math.cos(radian_dict[key]) * 2 * radius / 3,
                    y: -Math.sin(radian_dict[key]) * 2 * radius / 3
                });
            }
            for (let i = 0; i < 4; i++) {
                topo_links.push([topo_nodes[i], topo_nodes[i + 1]]);
            }
            topo_links.push([topo_nodes[4], topo_nodes[0]]);

        } else if (topo_type == 1) {
            //*************弱连通***************
            topo_nodes.push({
                x: 0,
                y: -2 * radius / 3
            });
            for (let key in radian_dict) {
                topo_nodes.push({
                    x: Math.cos(radian_dict[key]) * 2 * radius / 3,
                    y: -Math.sin(radian_dict[key]) * 2 * radius / 3
                });
            }
            topo_nodes.push({
                x: 0,
                y: 0
            });
            for (let i = 0; i < 4; i++) {
                topo_links.push([topo_nodes[i], topo_nodes[i + 1]]);
            }
            topo_links.push([topo_nodes[4], topo_nodes[0]]);
            topo_links.push([topo_nodes[5], topo_nodes[0]]);
            topo_links.push([topo_nodes[5], topo_nodes[2]]);
            topo_links.push([topo_nodes[5], topo_nodes[3]]);


        } else if (topo_type == 2) {
            //*************强连通***************
            topo_nodes.push({
                x: 0,
                y: -2 * radius / 3
            });
            for (let key in radian_dict) {
                topo_nodes.push({
                    x: Math.cos(radian_dict[key]) * 2 * radius / 3,
                    y: -Math.sin(radian_dict[key]) * 2 * radius / 3
                });
            }
            for (let i = 0; i < 4; i++) {
                topo_links.push([topo_nodes[i], topo_nodes[i + 1]]);
            }
            topo_links.push([topo_nodes[4], topo_nodes[0]]);
            topo_links.push([topo_nodes[0], topo_nodes[2]]);
            topo_links.push([topo_nodes[0], topo_nodes[3]]);
            topo_links.push([topo_nodes[1], topo_nodes[4]]);
            topo_links.push([topo_nodes[1], topo_nodes[3]]);
            topo_links.push([topo_nodes[2], topo_nodes[4]]);

        } else if (topo_type == 3) {
            //*************环中心发散***************
            topo_nodes.push({
                x: 0,
                y: -2 * radius / 3
            });
            for (let key in radian_dict) {
                topo_nodes.push({
                    x: Math.cos(radian_dict[key]) * 2 * radius / 3,
                    y: -Math.sin(radian_dict[key]) * 2 * radius / 3
                });
            }
            topo_nodes.push({
                x: 0,
                y: 0
            });
            for (let i = 0; i < 5; i++) {
                topo_links.push([topo_nodes[5], topo_nodes[i]]);
            }
        } else {
            //*************链***************
            for (let i = 0; i < 3; i++) {
                topo_nodes.push({
                    x: (-1 + i) * 2 * radius / 3,
                    y: 0
                });
            }
            for (let i = 0; i < 2; i++) {
                topo_links.push([topo_nodes[i], topo_nodes[i + 1]]);
            }
        }
        let topo_node_g = variable.svg_force.append('g').selectAll('circle').data(topo_nodes).enter()
            .append('circle')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', radius / 8)
            .attr('fill', 'white')
            .attr('stroke', 'white')

        let line = d3.line()
            .x(function (d) {
                return d.x
            })
            .y(function (d) {
                return d.y
            })
            .curve(d3.curveBasis)

        let topo_link_g = variable.svg_force.append('g').selectAll('path').data(topo_links).enter()
            .append('path')
            .attr('d', function (d) {
                return line(d)
            })
            .attr('stroke', 'white')
            .attr('stroke-width', radius / 12)
            .attr('fill', 'none')
        return [topo_node_g, topo_link_g];

    }

    function drawInnerTopo() {
        let tmp_svg = d3.select('#svg_force').append('svg')
            .attr('width', 100)
            .attr('height', 100)
            .style('background-color', 'black');
    }

    return {
        drawStaticForce,
        Clustering,
        drawPie,
        cluster_nodes,
        bundling_edge,
        edgeBundling,
        drawOriForce,
        calEntropy
    }
}())