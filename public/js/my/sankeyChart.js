let sankeyChart = (function () {
    // drawSankey();

    function drawSankey(nodes_data, links_data) {
        console.log('links_data: ', links_data);
        console.log('nodes_data: ', nodes_data);
        let sankey_width = $('#svg_sankey')[0].scrollWidth;
        let sankey_height = $('#svg_sankey')[0].scrollHeight;
        //nodes_data('id') link_data(source、target、value)
        variable.svg_sankey.selectAll('*').remove();
        let sankey = d3.sankey()
            .nodeId(function (d) { return d.id })
            .nodePadding(5)
            .nodeAlign(d3.sankeyCenter)
            .extent([[0.05*sankey_width, 0.3*sankey_height], [0.95*sankey_width, 1*sankey_height]]);
        const { nodes, links } = sankey({ nodes: nodes_data, links: links_data });
        const color = d3.scaleOrdinal(d3.schemeCategory20);

        function DIguiS(node) {
            $('#' + node.id).attr('opacity', 1);
            if (node.sourceLinks.length > 0) {
                let tmp_sourceLinks = node.sourceLinks;
                for (let l = 0; l < tmp_sourceLinks.length; l++) {
                    $('#' + tmp_sourceLinks[l].id).attr('opacity', 1);
                    // DIguiS(tmp_sourceLinks[l].target);
                    $('#' + tmp_sourceLinks[l].target.id).attr('opacity', 1);
                }
            } else {
                return;
            }
        }
        function DIguiT(node) {
            $('#' + node.id).attr('opacity', 1);
            if (node.targetLinks.length > 0) {
                let tmp_targetLinks = node.targetLinks;
                for (let l = 0; l < tmp_targetLinks.length; l++) {
                    $('#' + tmp_targetLinks[l].id).attr('opacity', 1);

                    $('#' + tmp_targetLinks[l].source.id).attr('opacity', 1);
                    // DIguiT(tmp_targetLinks[l].source);
                }
            } else {
                return;
            }
        }

        console.log('links: ', links);
        console.log('nodes: ', nodes);
        variable.svg_sankey.append("g")
            .selectAll("rect")
            .data(nodes)
            .enter()
            .append("rect")
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("height", d => Math.abs(d.y1 - d.y0))
            .attr("width", d => Math.abs(d.x1 - d.x0))
            .attr("stroke", '#329ccb')
            .attr("fill", '#329ccb')
            .attr('id', d => d.id)
            .on("mouseover", function (d) {
                let sourceLinks = d.sourceLinks, targetLinks = d.targetLinks;
                variable.svg_sankey.selectAll('path').attr('opacity', 0.1);
                variable.svg_sankey.selectAll('rect').attr('opacity', 0.1)
                DIguiS(d);
                DIguiT(d);
            }).on('mouseout', function () {
                variable.svg_sankey.selectAll('path').attr('opacity', 1);
                variable.svg_sankey.selectAll('rect').attr('opacity', 1)
            })
            .append("title");


        const link = variable.svg_sankey.append("g")
            .selectAll("path")
            .data(links)
            .enter()
            .append("path")
            .attr("fill", "none")
            .attr("stroke-opacity", 0.5)
            .style("mix-blend-mode", "multiply")
            .attr("d", d3.sankeyLinkHorizontal())
            .attr("stroke", '#d9d9d9')
            .attr("stroke-width", d => Math.max(1, d.width))
            .attr('id', function (d) {
                return d.id;
            });
    }
    return {
        drawSankey
    }
})()