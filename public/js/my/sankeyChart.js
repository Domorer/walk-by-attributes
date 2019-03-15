let sankeyChart = (function () {
    // drawSankey();
    function drawSankey(nodes_data, links_data) {
        let sankey = d3.sankey()
            .nodeId(function (d) { return d.id })
            .nodeWidth(15)
            .nodePadding(10)
            .extent([[1, 5], [100 - 1, 100 - 5]]);
        const { nodes, links } = sankey({ nodes: nodes_data, links: links_data });
        const color = d3.scaleOrdinal(d3.schemeCategory10);

        console.log('links: ', links);
        console.log('nodes: ', nodes);
        variable.svg_sankey.append("g")
            .attr("stroke", "#000")
            .selectAll("rect")
            .data(nodes)
            .enter()
            .append("rect")
            .attr("x", function (d) { return d.x0 })
            .attr("y", function (d) { return d.y0 })
            .attr("height", function (d) { return Math.abs(d.y1 - d.y0) })
            .attr("width", function (d) { return Math.abs(d.x1 - d.x0) })
            .attr("fill", 'blue')
            .append("title")
        const link = variable.svg_sankey.append("g")
            .attr("fill", "none")
            .attr("stroke-opacity", 0.5)
            .selectAll("g")
            .data(links)
            .enter()
            .append("g")
            .style("mix-blend-mode", "multiply");


        link.append("path")
            .attr("d", d3.sankeyLinkHorizontal())
            .attr("stroke", 'blue')
            .attr("stroke-width", d => Math.max(1, d.width));
    }

    return {
        drawSankey
    }
})()