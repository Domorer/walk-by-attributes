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
            .extent([[0.05 * sankey_width, 0.2 * sankey_height], [0.95 * sankey_width, 1 * sankey_height]]);
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
        console.log(option.comb_record)
        let option_status = [];
        for (let i = 0; i < option.comb_record.length; i++) {
            //当前选中的时间段数组
            let tmp_attrs = option.comb_record[i]['comb'].split('_');

            tmp_attrs.shift()
            option_status.push({
                wt: parseInt(option.comb_record[i].wt.split('_')[1]),
                sl: parseInt(option.comb_record[i].sl.split('_')[1]),
                rl: option.comb_record[i].rl.split('_')[1],
                comb: tmp_attrs
            })
        }
        let lineCal = d3.line()
            .x(d => d[0])
            .y(d => d[1])
        variable.svg_sankey.append('defs').append('marker')
            .attr('id', 'marker')
            .attr("viewBox", "0 0 12 12")
            .attr("refX", "6")
            .attr("refY", "6")
            .attr('orient', 'auto')
            .attr('markerWidth', 5)
            .attr('markerHeight', 5)
            .attr('xoverflow', 'visible')
            .append('path')
            .attr("d", "M2,2 L10,6 L2,10 L6,6 L2,2")
            .attr('fill', 'gray')
            .attr('stroke', 'gray');

        let True = [[0, 5], [4, 10], [10, 0]], False = [[0, 10], [5, 5], [0, 0], [5, 5], [10, 0], [5, 5], [10, 10]]

        for (let op = 0; op < option_status.length; op++) {
            let colSpace = ((0.85 / (option_status.length - 1)) * op + 0.05) * sankey_width
            variable.svg_sankey.append('g').selectAll('circle').data(option_status[op].comb).enter()
                .append('circle')
                .attr('cx', (d, i) => i * 10 + colSpace)
                .attr('cy', 0.15 * sankey_height)
                .attr('r', 4)
                .attr('fill', (d) => variable.attr_color[d])
            let updownLine = [
                [[colSpace, 0.15 * sankey_height - 10], [colSpace, 0.15 * sankey_height - 20]],
                [[colSpace + 10, 0.15 * sankey_height - 23], [colSpace + 10, 0.15 * sankey_height - 13]]
            ]
            let tmp_g = variable.svg_sankey.append('g')
            tmp_g.append('path')
                .attr('d', lineCal(updownLine[0]))
                .attr('stroke', 'gray')
                .attr('stroke-width', 2)
                .attr('fill', 'none')
                .attr('marker-end', 'url(#marker)')
            tmp_g.append('path')
                .attr('d', lineCal(updownLine[1]))
                .attr('stroke', 'gray')
                .attr('stroke-width', 2)
                .attr('fill', 'none')
                .attr('marker-end', 'url(#marker)')
            let tmp_tf = option_status[op].rl == 'True' ? [True] : [False]
            variable.svg_sankey.append('g').selectAll('path').data(tmp_tf).enter()
                .append('path')
                .attr('d', d => lineCal(d))
                .attr('stroke', 'gray')
                .attr('stroke-width', 2)
                .attr('fill', 'none')
                .attr('transform', `translate(${colSpace + 20}, ${0.15 * sankey_height - 23})`)

        }

    }


    return {
        drawSankey
    }
})()