let sankeyChart = (function () {
    // drawSankey();
    let sankey_width = $('#svg_sankey')[0].scrollWidth;
    let sankey_height = $('#svg_sankey')[0].scrollHeight;
    function drawSankey(nodes_data, links_data) {
        //nodes_data('id') link_data(source、target、value)
        let sankey = d3.sankey()
            .nodeId(function (d) { return d.id })
            .nodePadding(5)
            .nodeAlign(d3.sankeyCenter)
            .extent([[1, 5], [sankey_width - 1, sankey_height - 1]]);
        const { nodes, links } = sankey({ nodes: nodes_data, links: links_data });
        const color = d3.scaleOrdinal(d3.schemeCategory20);

        console.log('links: ', links);
        console.log('nodes: ', nodes);
        variable.svg_sankey.append("g")
            .selectAll("rect")
            .data(nodes)
            .enter()
            .append("rect")
            .attr("x", function (d) { return d.x0 })
            .attr("y", function (d) { return d.y0 })
            .attr("height", function (d) { return Math.abs(d.y1 - d.y0) })
            .attr("width", function (d) { return Math.abs(d.x1 - d.x0) })
            .attr("stroke", function (d) { return color(parseInt([d.id.split('-')[1]])) })
            .attr("fill", function (d) { return color(parseInt([d.id.split('-')[1]])) })
            .attr('id', function(d){return d.id})
            .append("title")

        const link = variable.svg_sankey.append("g")
            .selectAll("g")
            .data(links)
            .enter()
            .append("g")
            .attr("fill", "none")
            .attr("stroke-opacity", 0.5)
            .style("mix-blend-mode", "multiply");


        link.append("path")
            .attr("d", d3.sankeyLinkHorizontal())
            .attr("stroke", '#d9d9d9')
            .attr("stroke-width", d => Math.max(1, d.width));
    }

    return {
        drawSankey
    }
})()