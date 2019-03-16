let ForceChart = (function () {
    let forceWidth = $('#svg_force')[0].scrollWidth;
    let forceHeight = $('#svg_force')[0].scrollHeight;

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

    function Clustering(nodes, links, cluster_dict) {
        //直接只画类的点，不画类内的点
        let clusterValue_dict = {}, cluster_links = [], cluster_nodes = [];
        let r_extent = [], lineW_extent = [];
        //统计每个簇内的点数量
        for (let i = 0; i < ndoes.length; i++) {
            if (cluster_dict[nodes[i].id] != -1) {
                if (!clusterValue_dict[cluster_dict[nodes[i].id]]) {
                    clusterValue_dict[cluster_dict[nodes[i].id]] = 1;
                } else {
                    clusterValue_dict[cluster_dict[nodes[i].id]] += 1;
                }
            }
        }
        for (let key in clusterValue_dict) {
            let tmp_dict = {};
            tmp_dict['id'] = key;
            tmp_dict['value'] = clusterValue_dict[key];
            cluster_nodes.push(tmp_dict);
        }
        //设置半径的比例尺
        r_extent = d3.extent(cluster_nodes, function (d) { return d.value; })
        let rScale = d3.scaleLinear().domain(r_extent).range([5, 20]);
        //统计每条连线的权重
        let linksValue_dict = {};
        for (let i = 0; i < links.length; i++) {
            let s_cluster = cluster_dict[links[i].source];
            let t_cluster = cluster_dict[links[i].target];
            if (s_cluster != -1 && t_cluster != -1) {
                if (s_cluster != t_cluster) {
                    let tmp_key = s_cluster + '_' + t_cluster;
                    if (linksValue_dict[tmp_key])
                        linksValue_dict[tmp_key] = 1;
                    else
                        linksValue_dict[tmp_key] += 1;
                }
            }
        }
        for (let key in linksValue_dict) {
            let tmp_dict = {};
            tmp_dict['source'] = key.split('_')[0];
            tmp_dict['target'] = key.split('_')[1];
            tmp_dict['value'] = linksValue_dict[key];
            cluster_links.push(tmp_dict);
        }
        //设置线宽的比例尺
        lineW_extent = d3.extent(cluster_links, function (d) { return d.value; })
        let LWScale = d3.scaleLinear().domain(lineW_extent).range([5, 10]);
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
                if (cluster_dict[d.id] != -1)
                    return color(cluster_dict[d.id])
                else
                    return 'black';
            }).attr('class', function (d) {
                return 'cluster_' + d.id;
            });
        //画线
        let link = variable.svg_force.append('g').selectAll('line').data(links).enter()
            .append('line')
            .attr('stroke', function (d) {
                if (d.source === d.target)
                    return color(d.target);
                else
                    return 'gray';
            }).attr('stroke-width', function (d) {
                return LWScale(d.value);
            })
            .attr('opacity', 0.1)
            .attr('class', function (d) {
                return d.source + '_' + d.target;
            })
        
        
    }
    return {
        drawStaticForce,
        Clustering
    }
}())