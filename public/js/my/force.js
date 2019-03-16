let ForceChart = (function () {
    let forceWidth = $('#svg_force')[0].scrollWidth;
    let forceHeight = $('#svg_force')[0].scrollHeight;

    function drawForce(link_data, info_data, cluster_dict) {
        function transformData(info_data, link_data) {
            let tmp_data = [];
            // for (let key in info_data) {
            //     let tmp_dict = info_data[key];
            //     tmp_dict['id'] = key;
            //     tmp_data.push(tmp_dict);
            // }
            let id_dict = {};
            for (let i = 0; i < link_data.length; i++) {
                if (!id_dict[link_data[i].source]) {
                    id_dict[link_data[i].source] = true;
                    let tmp_dict = {};
                    tmp_dict['id'] = link_data[i].source;
                    tmp_data.push(tmp_dict);
                }
                if (!id_dict[link_data[i].target]) {
                    id_dict[link_data[i].target] = true;
                    let tmp_dict = {};
                    tmp_dict['id'] = link_data[i].target;
                    tmp_data.push(tmp_dict);
                }
            }
            return tmp_data;
        }
        //节点拖曳的相关函数
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

        let node_data = transformData(info_data, link_data);
        console.log('node_data: ', node_data);
        let simulation = d3.forceSimulation(node_data)
            .force("charge", d3.forceManyBody().strength(-5).distanceMax(100))
            .force("link", d3.forceLink(link_data).id(d => d.id))
            .force("center", d3.forceCenter(forceWidth / 2, forceHeight / 2))

        let color = d3.scaleOrdinal(d3.schemeCategory20);
        //绘制节点
        let node = variable.svg_force.append('g').selectAll('circle').data(node_data).enter()
            .append('circle')
            .attr('r', 2)
            .attr('stroke', function (d) {
                d.cluster = cluster_dict[d.id];
                if (d.cluster != -1)
                    return color(d.cluster)
                else
                    return 'black';
            }).attr('fill', function (d) {
                if (cluster_dict[d.id] != -1)
                    return color(cluster_dict[d.id])
                else
                    return 'black';
            }).attr('class', function (d) {
                return d.id;
            }).call(drag(simulation));

        //绘制边
        let link = variable.svg_force.append('g').selectAll('line').data(link_data).enter()
            .append('line')
            .attr('stroke', function (d) {
                let s_cluster = cluster_dict[d.source.id];
                let t_cluster = cluster_dict[d.target.id];
                if (s_cluster === t_cluster)
                    return color(parseInt(s_cluster));
                else
                    return 'gray';
            }).attr('stroke-width', 1)
            .attr('opacity', 0.1)
            .attr('class', function (d) {
                return d.id + '_' + d.id;
            })

        //设置力的作用函数
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
        // $('#confirm').on('click', function () {
        //     // let loc_data = [];
        //     // for (let i = 0; i < node_data.length; i++) {

        //     //     loc_data[node_data[i].id] = [node_data[i].x, node_data[i].y];
        //     // }
        //     var blob = new Blob([JSON.stringify(node_data)], { type: "" });
        //     saveAs(blob, "hello world.json");
        // });

    }
    function drawStaticForce(nodes, links, cluster_dict) {
        console.log('links: ', links);
        let color = d3.scaleOrdinal(d3.schemeCategory20);

        //绘制节点
        let node = variable.svg_force.append('g').selectAll('circle').data(nodes).enter()
            .append('circle')
            .attr('r', 2)
            .attr('cx', function (d) { return d.x; })
            .attr('cy', function (d) { return d.y; })
            .attr('stroke', function (d) {
                d.cluster = cluster_dict[d.id];
                if (d.cluster != -1)
                    return color(d.cluster)
                else
                    return 'black';
            }).attr('fill', function (d) {
                if (cluster_dict[d.id] != -1)
                    return color(cluster_dict[d.id])
                else
                    return 'black';
            }).attr('class', function (d) {
                return d.id;
            });
        
            let line = d3.line()
                        .x(function(d){return d[0]})
                        .y(function(d){return d[1]})
        let link = variable.svg_force.append('g').selectAll('path').data(links).enter()
            .append('path')
            .attr('d', function(d){return line(d.loc)})
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
    return {
        drawForce,
        drawStaticForce
    }
}())