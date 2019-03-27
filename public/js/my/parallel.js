let parallel = (function () {

    let svg_parallel = d3.select('#svg_parallel');
    function drawParallel(cluster) {
        svg_parallel.selectAll('*').remove();
        let svg_width = $("#svg_parallel")[0].scrollWidth;
        let svg_height = $("#svg_parallel")[0].scrollHeight;
        //添加标签
        let periods = ['6-9', '10-13', '14-17', '18-21', '22-5']
        let texts = svg_parallel.append('g').selectAll('text').data(periods).enter()
            .append('text')
            .attr('x', (d, i) => (i + 0.5) * svg_width / 5)
            .attr('y', 0.07 * svg_height)
            .attr('font-size', 13)
            .attr('color', (d, i) => variable.attr_color[i])
            .attr('stroke-width', 1)
            .attr('stroke', (d, i) => variable.attr_color[i])
            .attr('fill', (d, i) => variable.attr_color[i])
            .attr('text-anchor', 'middle')
            .text(d => d)

        //添加时间段轴
        let attrs_line = []
        for (let i = 0; i < 5; i++) {
            attrs_line.push(
                [[(i + 0.5) * svg_width / 5,
                0.1 * svg_height],
                [(i + 0.5) * svg_width / 5,
                0.9 * svg_height]]
            )
        }

        let line = d3.line()
            .x(d => d[0])
            .y(d => d[1])
        let yaxis = svg_parallel.append('g').selectAll('path').data(attrs_line).enter()
            .append('path')
            .attr('d', d => line(d))
            .attr('stroke', (d, i) => variable.attr_color[i])
            .attr('stroke-width', 2);

        //此时的每条线应该代表的是类内的一个点，点在每个属性上的值代表该点与类内点的连线轨迹的权重值和除于该点所有连线的权重之和
        let value_arr = [];
        let tmp_ids = variable.cluster_ids_dict[cluster]
        for (let i = 0; i < tmp_ids.length; i++) {
            let tmp_targets = variable.station_links_dict[tmp_ids[i]];
            let inner_value = new Array(5).fill(0), outer_value = new Array(5).fill(0);
            for (let j = 0; j < tmp_targets.length; j++) {
                let tmp_link_key = Math.min(parseInt(tmp_ids[i]), parseInt(tmp_targets[j])) + '_' + Math.max(parseInt(tmp_ids[i]), parseInt(tmp_targets[j]));
                if (tmp_ids.indexOf(tmp_targets[j]) != -1)
                    for (let a = 0; a < 5; a++)
                        inner_value[a] += variable.period_dict[tmp_link_key][a]
                if (tmp_ids.indexOf(tmp_targets[j]) == -1)
                    for (let a = 0; a < 5; a++)
                        outer_value[a] += variable.period_dict[tmp_link_key][a]
            }
            let ratio_arr = new Array(5);
            for (let a = 0; a < 5; a++) {
                if (inner_value[a] == 0 && outer_value[a] == 0)
                    ratio_arr[a] = 0;
                else
                    ratio_arr[a] = inner_value[a] / (inner_value[a] + outer_value[a])
            }
            value_arr.push(ratio_arr);
        }
        // for (let i = 0; i < variable.clu_tpg[cluster].length; i++) {
        //     let tmp_value = variable.clu_tpg[cluster][i].value;

        //     let tmp_link = [];
        //     for (let attr in tmp_value) {
        //         tmp_link.push(tmp_value[attr])
        //     }
        //     value_arr.push(tmp_link);
        // }
        // console.log('value_arr: ', value_arr);

        let scale_arr = [];
        for (let i = 0; i < 5; i++) {
            let tmp_max = d3.max(value_arr, d => d[i])
            let tmp_scale = d3.scaleLinear().domain([0, 1]).range([0.9 * svg_height, 0.1 * svg_height])
            scale_arr.push(tmp_scale);
        }
        let line_arr = [];
        // console.log('value_arr: ', value_arr);
        for (let i = 0; i < value_arr.length; i++) {

            tmp_line = [];
            for (let j = 0; j < 5; j++) {
                // links[i].value[j] = [(j+0.5)*svg_width, scale_arr[j](links[i].value[j])]
                tmp_line.push([(j + 0.5) * svg_width / 5, scale_arr[j](value_arr[i][j])])
            }
            line_arr.push(tmp_line)

        }
        // console.log('line_arr: ', line_arr);
        // console.log('line_arr: ', line_arr);
        // console.log('links: ', value_arr);
        let line_cluster = d3.line()
            .x(d => d[0])
            .y(d => d[1])
            .curve(d3.curveBasis)
        let lines = svg_parallel.append('g').selectAll('path').data(line_arr).enter()
            .append('path')
            .attr('d', d => line_cluster(d))
            .attr('stroke', '#9d9d9d')
            .attr('stroke-width', 1)
            .attr('fill', 'none')
            .attr('opacity', 0.3)
            .on('click', function (d, i) {
                console.log(i);
            })
    }

    return {
        drawParallel
    }
})()