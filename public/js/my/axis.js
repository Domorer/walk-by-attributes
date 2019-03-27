let axisChart = (function () {
   
    function drawAxis(comb_data) {
        let sankey_width = $('#svg_parallel')[0].scrollWidth;
        let sankey_height = $('#svg_parallel')[0].scrollHeight;
        variable.svg_sankey.selectAll('circle').remove();
        let loc_arr = [];

        for (let key in comb_data['loc']) {
            tmp_node = {};
            tmp_node['loc'] = [parseFloat(comb_data['loc'][key][0]), parseFloat(comb_data['loc'][key][1])];
            tmp_node['db_clu'] = key;
            tmp_node['k_clu'] = comb_data['id_k_clu'][key];
            loc_arr.push(tmp_node)
        }
        console.log('loc_arr: ', loc_arr);
        let min_x = d3.min(loc_arr, d => d.loc[0]);
        let min_y = d3.min(loc_arr, d => d.loc[1]);
        let max_x = d3.max(loc_arr, d => d.loc[0]);
        let max_y = d3.max(loc_arr, d => d.loc[1]);
        let xScale = d3.scaleLinear().domain([min_x, max_x]).range([30, sankey_width / 2 - 30])
        let yScale = d3.scaleLinear().domain([min_y, max_y]).range([sankey_height - 15, 15])
        let color = d3.scaleOrdinal(d3.schemeCategory20);

        variable.svg_sankey.append('g').selectAll('circle').data(loc_arr).enter()
            .append('circle')
            .attr('cx', d => xScale(d.loc[0]))
            .attr('cy', d => yScale(d.loc[1]))
            .attr('fill', d => color(d.k_clu))
            .attr('stroke', d => color(d.k_clu))
            .attr('r', 5)
            .on('click', function (d) {
                let clu_ids = comb_data['k_clu_ids'][d.k_clu];
                let links = [], node_dict = {}, nodes = [];
                for (let i = 0; i < clu_ids.length; i++) {
                    for (let j = 0; j < comb_data.clu_tpg[clu_ids[i]].length; j++) {
                        let tmp_link = comb_data.clu_tpg[clu_ids[i]][j];
                        links.push({ 'source': tmp_link[0], 'target': tmp_link[1] })
                        if (node_dict[tmp_link[0]] == undefined)
                            node_dict[tmp_link[0]] = true;
                        if (node_dict[tmp_link[1]] == undefined)
                            node_dict[tmp_link[1]] = true;
                    }
                }

                for (let key in node_dict) {
                    nodes.push({ 'id': key })
                }
                drawTopo(nodes, links);
            })
    }

    function drawTopo(nodes, links) {
        variable.svg_scatter.selectAll('*').remove();

        let forceClusterWidth = $('#svg_scatter')[0].scrollWidth;
        let forceClusterHeight = $('#svg_scatter')[0].scrollHeight;

       
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
        let link_cluster = variable.svg_scatter.append('g').selectAll('line').data(links).enter()
            .append('line')
            .attr('stroke', '#999')
            .attr('opacity', 0.5)
            .attr('stroke-width', 2)
        //画点
        let node_cluster = variable.svg_scatter.append('g').selectAll('circle').data(nodes).enter()
            .append('circle')
            .attr('r', 3)
            .attr('stroke', '#b4b4ff')
            .attr('fill', '#b4b4ff')
            .call(drag_cluster(simulation_cluster));


    }
    return {
        drawAxis
    }
})()