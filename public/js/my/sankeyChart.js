let variable = (function () {

    function drawSankey(cluster_data) {
        variable.svg_sankey.append("g")
            .attr("fill", "none")
            .attr("stroke", "#000")
            .attr("stroke-opacity", 0.2)
            .selectAll("path")
            .data(graph.links)
            .join("path")
            .attr("d", d3.sankeyLinkHorizontal())
            .attr("stroke-width", function (d) { return d.width; });
    }

    return {
        drawSankey
    }
})()