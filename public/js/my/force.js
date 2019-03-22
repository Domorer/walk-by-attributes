let ForceChart = (function () {
    let forceWidth = $('#svg_force')[0].scrollWidth;
    let forceHeight = $('#svg_force')[0].scrollHeight;

    function drawStaticForce(nodes, links, cluster_dict) {
        let color = d3.scaleOrdinal(d3.schemeCategory20);
        //绘制节点
        let node = variable.svg_force.append('g').selectAll('circle').data(nodes).enter()
            .append('circle')
            .attr('r', 2)
            .attr('cx', function (d) { return d.x; })
            .attr('cy', function (d) { return d.y; })
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
            .x(function (d) { return d[0] })
            .y(function (d) { return d[1] })
        let link = variable.svg_force.append('g').selectAll('path').data(links).enter()
            .append('path')
            .attr('d', function (d) { return line(d.loc) })
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

    //绘制簇内点的原始力引导图
    function drawClusterForce(id_links) {
        let forceClusterWidth = $('#svg_oriTopo')[0].scrollWidth;
        let forceClusterHeight = $('#svg_oriTopo')[0].scrollHeight;
        let svg_cluster = d3.select('#svg_oriTopo');
        svg_cluster.selectAll('*').remove();
        let nodes = [], links = [], nodes_dict = {};
        for (let i = 0; i < id_links.length; i++) {
            links.push({ 'source': id_links[i][0], 'target': id_links[i][1] });
            if (nodes_dict[id_links[i][0]] == undefined)
                nodes_dict[id_links[i][0]] = true;
            if (nodes_dict[id_links[i][1]] == undefined)
                nodes_dict[id_links[i][1]] = true;
        }
        for (let key in nodes_dict) {
            nodes.push({ 'id': key });
        }
        let simulation_cluster = d3.forceSimulation(nodes)
            .force("charge", d3.forceManyBody().distanceMax(50))
            .force("link", d3.forceLink(links).id(d => d.id))
            .force("center", d3.forceCenter(forceClusterWidth / 2, forceClusterHeight / 2))
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
        let link_cluster = svg_cluster.append('g').selectAll('line').data(links).enter()
            .append('line')
            .attr('stroke', '#bfbfbf')
            .attr('opacity', 0.5)
            .attr('stroke-width', 2)
        //画点
        let node_cluster = svg_cluster.append('g').selectAll('circle').data(nodes).enter()
            .append('circle')
            .attr('r', 3)
            .attr('stroke', '#b4b4ff')
            .attr('fill', '#b4b4ff')
            .call(drag_cluster(simulation_cluster));


    }


    //************绘制聚类后的力引导图************
    let radian = 45 * 0.017453293;
    console.log(Math.tan(radian));
    function Clustering(clusterids_dict, clusterLinks_dict, cluster_dict) {
        console.log('clusterLinks_dict: ', clusterLinks_dict);
        variable.svg_force.selectAll('*').remove();
        //直接只画类的点，不画类内的点
        let cluster_links = [], cluster_nodes = [];
        let r_extent = [], lineW_extent = [];
        let color = d3.scaleOrdinal(d3.schemeCategory20);

        //统计每个簇内的点数量
        for (let key in clusterids_dict) {
            let tmp_dict = {};
            tmp_dict['id'] = key;
            tmp_dict['value'] = parseInt(clusterids_dict[key].length);

            cluster_nodes.push(tmp_dict);
        }
        //设置半径的比例尺
        r_extent = d3.extent(cluster_nodes, function (d) { return d.value; })
        let rScale = d3.scaleLinear().domain(r_extent).range([5, 30]);
        //统计每条连线的权重
        for (let key in clusterLinks_dict) {
            if (key.split('-')[0] != key.split('-')[1]) {
                let tmp_dict = {};
                tmp_dict['source'] = key.split('-')[0];
                tmp_dict['target'] = key.split('-')[1];
                tmp_dict['ratio'] = clusterLinks_dict[key]['ratio']
                tmp_dict['value'] = parseInt(clusterLinks_dict[key]['value']);
                cluster_links.push(tmp_dict);
            }
        }
        //设置线宽的比例尺
        lineW_extent = d3.extent(cluster_links, function (d) { return d.value; })
        console.log('cluster_links: ', cluster_links);
        let LWScale = d3.scaleLinear().domain(lineW_extent).range([1, 10]);
        let OPScale = d3.scaleLinear().domain(lineW_extent).range([0.05, 1]);
        console.log('lineW_extent: ', lineW_extent);

        //设置力的作用
        let simulation = d3.forceSimulation(cluster_nodes)
            .force("charge", d3.forceManyBody().strength(-500).distanceMin(100))
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
                if (d.source.id === d.target.id)
                    return color(d.target.id);
                else
                    return '#999';
            }).attr('stroke-width', function (d) {
                return LWScale(d.value);
                // return 2;
            })
            .attr('opacity', function (d) {
                return OPScale(d.value);
            })
            .attr('class', function (d) {
                return d.source + '_' + d.target;
            })
        //画点
        let node = variable.svg_force.append('g').selectAll('circle').data(cluster_nodes).enter()
            .append('circle')
            .attr('r', function (d) {
                return rScale(d.value);
            })
            .attr('stroke', function (d) {
                if (d.id != -1)
                    return color(d.id)
                else
                    return 'black';
            }).attr('fill', function (d) {
                if (d.id != -1)
                    return color(d.id)
                else
                    return 'black';
            }).attr('class', function (d) {
                return 'cluster_' + d.id;
            })
            .on('click', function (d) {
                drawClusterForce(variable.comb_data['clu_tpg'][d.id]);
            }).call(drag(simulation))

        //画园内的pattern

        let pattern_g = [];

        for (let i = 0; i < cluster_nodes.length; i++) {
            let tmp_g = drawTopo(Math.floor(Math.random()*5), rScale(cluster_nodes[i].value))
            pattern_g.push({ node: tmp_g[0], link: tmp_g[1], value: cluster_nodes[i].value });
        }
        console.log('pattern_g: ', pattern_g);
        // let node_pattern = variable.svg_force.append('g').selectAll('circle').data(pattern_nodes).enter()
        //     .append('circle')
        //     .attr('r', function (d) {
        //         return rScale(d.value) / 8;
        //     })
        //     .attr('stroke', 'white')
        //     .attr('fill', 'white')
        //     .attr('class', function (d) {
        //         return 'pattern_' + d.cluster + '_' + d.pos;
        //     });

        // let line = d3.line()
        //     .x(function (d) { return d[0] })
        //     .y(function (d) { return d[1] })
        //     .curve(d3.curveBasis)
        // let pattern_links = [];
        // for (let i = 0; i < cluster_nodes.length; i++) {
        //     pattern_links.push({ loc: [[0, 0], [0, 0], [0, 0]], value: cluster_nodes[i].value, index: i })
        // }
        // let link_pattern = variable.svg_force.append('g').selectAll('path').data(pattern_links).enter()
        //     .append('path')
        //     // .attr('d', function (d) { return line(d.loc) })
        //     .attr('stroke', 'white')
        //     .attr('stroke-width', d => rScale(d.value) / 12)
        //     .attr('fill', 'none')

        let radian_dict = {
            'left_top': 162 * (2 * Math.PI / 360),
            'left_bottom': 234 * (2 * Math.PI / 360),
            'right_top': 18 * (2 * Math.PI / 360),
            'right_bottom': 308 * (2 * Math.PI / 360)
        }
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
            for (let i = 0; i < pattern_g.length; i++) {
                pattern_g[i].node.attr('transform', "translate(" + cluster_nodes[i].x + ',' + cluster_nodes[i].y + ')');
                pattern_g[i].link.attr('transform', "translate(" + cluster_nodes[i].x + ',' + cluster_nodes[i].y + ')');

            }
            // node_pattern
            //     .attr("cx", function (d) {
            //         if (d.pos != 'top')
            //             return cluster_nodes[d.index].x + Math.cos(radian_dict[d.pos]) * rScale(d.value) / 2;
            //         else
            //             return cluster_nodes[d.index].x;
            //     })
            //     .attr("cy", function (d) {
            //         if (d.pos != 'top')
            //             return cluster_nodes[d.index].y + Math.sin(radian_dict[d.pos]) * rScale(d.value) / 2;
            //         else
            //             return cluster_nodes[d.index].y + rScale(d.value) / 2;
            //     });

            // link_pattern.attr('d', function (d) {
            //     let tmp_source = [cluster_nodes[d.index].x - rScale(d.value) / 3, cluster_nodes[d.index].y + rScale(d.value) / 2];
            //     let tmp_target = [cluster_nodes[d.index].x + rScale(d.value) / 3, cluster_nodes[d.index].y + rScale(d.value) / 2];
            //     let tmp_middle = [cluster_nodes[d.index].x, cluster_nodes[d.index].y + rScale(d.value) * 4 / 5];
            //     let tmp_loc = [tmp_source, tmp_middle, tmp_target];
            //     return line(tmp_loc);
            // })
        });
    }

    function drawTopo(topo_type, radius) {
        let topo_nodes = [], topo_links = [];
        let radian_dict = {
            'left_top': 162 * (2 * Math.PI / 360),
            'left_bottom': 234 * (2 * Math.PI / 360),
            'right_bottom': 308 * (2 * Math.PI / 360),
            'right_top': 18 * (2 * Math.PI / 360)
        }
        if (topo_type == 0) {
            //*************环***************
            topo_nodes.push({ x: 0, y: -radius / 2 });
            for (let key in radian_dict) {
                topo_nodes.push({ x: Math.cos(radian_dict[key]) * radius / 2, y: -Math.sin(radian_dict[key]) * radius / 2 });
            }
            for (let i = 0; i < 4; i++) {
                topo_links.push([topo_nodes[i], topo_nodes[i + 1]]);
            }
            topo_links.push([topo_nodes[4], topo_nodes[0]]);

        } else if (topo_type == 1) {
            //*************弱连通***************
            topo_nodes.push({ x: 0, y: -radius / 2 });
            for (let key in radian_dict) {
                topo_nodes.push({ x: Math.cos(radian_dict[key]) * radius / 2, y: -Math.sin(radian_dict[key]) * radius / 2 });
            }
            topo_nodes.push({ x: 0, y: 0 });
            for (let i = 0; i < 4; i++) {
                topo_links.push([topo_nodes[i], topo_nodes[i + 1]]);
            }
            topo_links.push([topo_nodes[4], topo_nodes[0]]);
            topo_links.push([topo_nodes[5], topo_nodes[0]]);
            topo_links.push([topo_nodes[5], topo_nodes[2]]);
            topo_links.push([topo_nodes[5], topo_nodes[3]]);


        } else if (topo_type == 2) {
            //*************强连通***************
            topo_nodes.push({ x: 0, y: -radius / 2 });
            for (let key in radian_dict) {
                topo_nodes.push({ x: Math.cos(radian_dict[key]) * radius / 2, y: -Math.sin(radian_dict[key]) * radius / 2 });
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
            topo_nodes.push({ x: 0, y: -radius / 2 });
            for (let key in radian_dict) {
                topo_nodes.push({ x: Math.cos(radian_dict[key]) * radius / 2, y: -Math.sin(radian_dict[key]) * radius / 2 });
            }
            topo_nodes.push({ x: 0, y: 0 });
            for (let i = 0; i < 5; i++) {
                topo_links.push([topo_nodes[5], topo_nodes[i]]);
            }
        } else {
            //*************链***************
            for (let i = 0 ; i < 3; i++) {
                topo_nodes.push({ x:  (-1 + i)*radius / 2, y:0});
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
            .x(function (d) { return d.x })
            .y(function (d) { return d.y })
            .curve(d3.curveBasis)

        let topo_link_g = variable.svg_force.append('g').selectAll('path').data(topo_links).enter()
            .append('path')
            .attr('d', function (d) { return line(d) })
            .attr('stroke', 'white')
            .attr('stroke-width', radius / 12)
            .attr('fill', 'none')
        return [topo_node_g, topo_link_g];

    }

    return {
        drawStaticForce,
        Clustering
    }
}())