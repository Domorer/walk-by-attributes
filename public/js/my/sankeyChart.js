let sankeyChart = (function () {
    // drawSankey();   
    let firstChildren = true;

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
        let { nodes, links } = sankey({ nodes: nodes_data, links: links_data });
        for (let i = 0; i < nodes.length; i++) {
            nodes[i].clu = nodes[i].id.split('-').pop();
        }
        const color = d3.scaleOrdinal(d3.schemeCategory20);

        //递归寻找source
        function DIguiS(node, stations_arr, sourceId) {
            $('#' + node.id).attr('opacity', 1);
            if (node.sourceLinks.length > 0) {
                let tmp_sourceLinks = node.sourceLinks;
                for (let l = 0; l < tmp_sourceLinks.length; l++) {
                    for (let s = 0; s < stations_arr.length; s++) {
                        if (tmp_sourceLinks[l].stations.indexOf(stations_arr[s]) != -1) {
                            if (tmp_sourceLinks[l].source.id == sourceId)
                                $('#' + tmp_sourceLinks[l].id).attr('stroke', 'black').attr('opacity',1);
                            else
                                $('#' + tmp_sourceLinks[l].id).attr('opacity', 1);
                            DIguiS(tmp_sourceLinks[l].target, stations_arr);
                            break;
                        }
                        continue;
                    }
                    // if (tmp_sourceLinks[l].stations.indexOf(node.clu) != -1) {
                    $('#' + tmp_sourceLinks[l].target.id).attr('opacity', 1);
                    // }
                }
            } else {
                return;
            }
        }
        //递归寻找Target
        function DIguiT(node, stations_arr) {
            $('#' + node.id).attr('opacity', 1);
            if (node.targetLinks.length > 0) {
                let tmp_targetLinks = node.targetLinks;
                for (let l = 0; l < tmp_targetLinks.length; l++) {
                    for (let s = 0; s < stations_arr.length; s++) {
                        if (tmp_targetLinks[l].stations.indexOf(stations_arr[s]) != -1) {
                            $('#' + tmp_targetLinks[l].id).attr('opacity', 1);
                            DIguiT(tmp_targetLinks[l].source, stations_arr);
                            break;
                        }
                        continue;
                    }
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

                // variable.svg_sankey.selectAll('.sankeyLink').attr('opacity', 0.1);
                // variable.svg_sankey.selectAll('rect').attr('opacity', 0.1);

                // DIguiS(d, d.stations);
                // DIguiT(d, d.stations);
            }).on('mouseout', function () {
                // variable.svg_sankey.selectAll('path').attr('opacity', 1);
                // variable.svg_sankey.selectAll('rect').attr('opacity', 1)
            }).on('click', (d, i) => {

                variable.svg_sankey.selectAll('.sankeyLink').attr('stroke','#8F8A8F').attr('opacity', 0.1);
                variable.svg_sankey.selectAll('rect').attr('opacity', 0.1);

                DIguiS(d, d.stations, d.id);
                DIguiT(d, d.stations);
                let id_arr = []; //保存所有需要滑到地图上的点的id和标记
                let tmp_arr = [];
                //保存所有target内的所有点, sourceLinks 代表以自己为起始点的连线
                for (let n = 0; n < d.sourceLinks.length; n++) {
                    tmp_arr = []
                    for (let t = 0; t < d.sourceLinks[n].target.stations.length; t++) {
                        tmp_arr.push({ id: d.sourceLinks[n].target.stations[t], type: false })
                    }
                    id_arr.push(tmp_arr);
                }
                //保存当前块内的所有点
                tmp_arr = []
                for (let n = 0; n < d.stations.length; n++)
                    tmp_arr.push({ id: d.stations[n], selected: true })
                id_arr.push(tmp_arr)
                console.log('id_arr: ', id_arr);
                mapView.drawSk(id_arr);
            });


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
            }).attr('class', 'sankeyLink')
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
            let upline = [[colSpace, 0.15 * sankey_height - 10], [colSpace, 0.15 * sankey_height - 20]],
                downline = [[colSpace, 0.15 * sankey_height - 23], [colSpace, 0.15 * sankey_height - 13]],
                sameline = [[colSpace - 4, 0.15 * sankey_height - 17], [colSpace + 4, 0.15 * sankey_height - 17]]
            let updownLine = [[], []]
            let wtArrow = true, slArrow = true
            if (op == 0) {
                updownLine = [sameline, sameline];
                wtArrow = false
                slArrow = false
            }
            //判断wt
            if (op > 0 && option_status[op].wt > option_status[op - 1].wt)
                updownLine[0] = upline
            else if (op > 0 && option_status[op].wt < option_status[op - 1].wt)
                updownLine[0] = downline
            else if (op > 0 && option_status[op].wt == option_status[op - 1].wt) {
                wtArrow = false
                updownLine[0] = sameline
            }
            //判断sl
            if (op > 0 && option_status[op].sl > option_status[op - 1].sl)
                updownLine[1] = upline
            else if (op > 0 && option_status[op].sl < option_status[op - 1].sl)
                updownLine[1] = downline
            else if (op > 0 && option_status[op].sl == option_status[op - 1].sl) {
                slArrow = false
                updownLine[1] = sameline
            }

            let tmp_g = variable.svg_sankey.append('g')
            tmp_g.append('path')
                .attr('d', lineCal(updownLine[0]))
                .attr('stroke', 'gray')
                .attr('stroke-width', 2)
                .attr('fill', 'none')
                .attr('marker-end', wtArrow ? 'url(#marker)' : 'none')
            tmp_g.append('path')
                .attr('d', lineCal(updownLine[1]))
                .attr('stroke', 'gray')
                .attr('stroke-width', 2)
                .attr('fill', 'none')
                .attr('marker-end', slArrow ? 'url(#marker)' : 'none')
                .attr('transform', 'translate(10,0)')
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
        drawSankey,
        firstChildren
    }
})()