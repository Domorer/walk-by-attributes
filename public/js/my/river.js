let riverView = (function () {
    let value_arr = [], river_g, clusterArr_record = [];
    let symbol_g, directLine_g;
    function Cal(data, cluster_arr, symbol, node) {
        //当前选中的时间段数组
        let tmp_attrs = variable.param.comb.split('_');
        tmp_attrs.shift()
        let children_dict = data['children_dict'], level_dict = data['level_dict'] //每个层拥有的所有id集合的字典;
        console.log('cluster_arr: ', cluster_arr);
        //各个类间连线的流量总和、各个类的选中属性的 类内流量占比 之和, 统计数值数组
        let cluBtLink_wt_dict = {}, cluRatio_dict = {}, value_dict = { inner: 0, interval: 0, clusterCounts: 0 };
        //遍历树，获取当前节点所连的所有末端节点的集合
        let dfs = function (root) {
            var arr = [], res = [];
            if (root != null) {
                arr.push(root);
            }
            while (arr.length != 0) {
                var temp = arr.pop();
                if (temp.left == null && temp.right == null)
                    res.push(temp.id);
                //这里先放右边再放左边是因为取出来的顺序相反
                if (temp.right != null) {
                    arr.push(children_dict[temp.right]);
                }
                if (temp.left != null) {
                    arr.push(children_dict[temp.left]);
                }
            }
            return res;
        }
        //计算每个类内所有站点的集合
        let cluster_ids_dict = {}
        for (let i = 0; i < cluster_arr.length; i++) {
            let tmp_topNode = cluster_arr[i];
            cluster_ids_dict[tmp_topNode] = dfs(children_dict[tmp_topNode]);
        }
        // console.log('cluster_ids_dict: ', cluster_ids_dict);
        //计算站点的所在类字典
        let id_cluster_dict = {}, index = 0;
        for (let key in cluster_ids_dict) {
            for (let i = 0; i < cluster_ids_dict[key].length; i++) {
                id_cluster_dict[cluster_ids_dict[key][i]] = { cluster: key, index: index }
            }
            index += 1;
        }

        //*************计算各个簇之间的选中时间段的流量的权重字典*************
        for (let i = 0; i < variable.oriLinks.length; i++) {
            let tmp_link = variable.oriLinks[i];
            //判断当前连线是否存在于本次游走的数据集内
            if (id_cluster_dict[tmp_link['source']] != null && id_cluster_dict[tmp_link['target']] != null) {
                let s_cluster = id_cluster_dict[tmp_link['source']].cluster,
                    t_cluster = id_cluster_dict[tmp_link['target']].cluster;
                let tmp_cluLink_key = s_cluster + '-' + t_cluster;  //当前簇之间的连线
                let tmp_StLink_key = tmp_link['source'] + '_' + tmp_link['target'];//当前轨迹
                // let tmp_value = variable.period_dict[tmp_StLink_key]
                let tmp_value = 1;
                //如果当前簇连线已经存在
                if (cluBtLink_wt_dict[tmp_cluLink_key] != null) {
                    //当前时间段流量相加
                    for (let a = 0; a < tmp_attrs.length; a++)
                        // cluBtLink_wt_dict[tmp_cluLink_key] += tmp_value[a];
                        cluBtLink_wt_dict[tmp_cluLink_key] += 1
                }
                else {
                    cluBtLink_wt_dict[tmp_cluLink_key] = 0;
                    for (let a = 0; a < tmp_attrs.length; a++)
                        // cluBtLink_wt_dict[tmp_cluLink_key] += tmp_value[a];
                        cluBtLink_wt_dict[tmp_cluLink_key] += 1
                }
            }
        }
        //通过判断连线键值的始末cluster相同来区分类内和类间流量
        let tmp_key;
        for (let key in cluBtLink_wt_dict) {
            tmp_key = key.split('-')
            if (tmp_key[0] == tmp_key[1]) {
                value_dict['inner'] += cluBtLink_wt_dict[key];
            } else {
                value_dict['interval'] += cluBtLink_wt_dict[key]
            }
        }

        //循环每个类内，计算类内的所有点的 与类内连线的流量除于总流量的比值 的均值
        // console.log('cluster_ids_dict: ', cluster_ids_dict);
        // for (let clu = 0; clu < cluster_arr.length; clu++) {
        //     let attrs_value = new Array(5).fill(0);
        //     let tmp_ids = cluster_ids_dict[cluster_arr[clu]]

        //     for (let i = 0; i < tmp_ids.length; i++) {
        //         let tmp_targets = variable.station_links_dict[tmp_ids[i]];
        //         let inner_value = new Array(5).fill(0), outer_value = new Array(5).fill(0);
        //         for (let j = 0; j < tmp_targets.length; j++) {
        //             let tmp_link_key = Math.min(parseInt(tmp_ids[i]), parseInt(tmp_targets[j])) + '_' + Math.max(parseInt(tmp_ids[i]), parseInt(tmp_targets[j]));
        //             if (tmp_ids.indexOf(tmp_targets[j]) != -1)
        //                 for (let a = 0; a < 5; a++)
        //                     inner_value[a] += variable.period_dict[tmp_link_key][a]
        //             if (tmp_ids.indexOf(tmp_targets[j]) == -1)
        //                 for (let a = 0; a < 5; a++)
        //                     outer_value[a] += variable.period_dict[tmp_link_key][a]
        //         }
        //         let ratio_arr = new Array(5);
        //         for (let a = 0; a < tmp_attrs.length; a++) {
        //             if (inner_value[a] == 0 && outer_value[a] == 0)
        //                 ratio_arr[a] = 0;
        //             else
        //                 ratio_arr[a] = inner_value[a] / (inner_value[a] + outer_value[a])
        //         }

        //         for (let a = 0; a < ratio_arr.length; a++) {
        //             attrs_value[a] += ratio_arr[a] / tmp_ids.length;
        //         }
        //     }
        //     for (let a = 0; a < tmp_attrs.length; a++) {
        //         value_dict['ratioSum'] += attrs_value[parseInt(tmp_attrs[a])] / cluster_arr.length
        //     }
        // }
        value_dict['inner'] = 1 / value_dict['inner']  //类内流量取倒数
        value_dict['clusterCounts'] = 1 / cluster_arr.length; // 当前类的数量的倒数
        value_dict['symbol'] = symbol;  //保存本次操作的标志
        value_dict['node'] = node;  //保存操作的节点ID
        value_dict['cluster_arr'] = clusterFun.deepCopy(cluster_arr); //保存本次操作结果的cluster_arr
        riverView.value_arr.push(value_dict)
    }
    function modifyRiver(data, cluster_arr, separate, node) {
        let colorSelected = { fill: '#ff957c', stroke: '#ff4416' }, colorOri = { fill: '#B6E9FF', stroke: '#329CCB' }
        console.log('cluster_arr: ', cluster_arr);
        //将当前的类数组存入record
        riverView.clusterArr_record.push(cluster_arr);
        if (!separate)
            Cal(data, cluster_arr, d3.symbolCross, node)
        else
            Cal(data, cluster_arr, d3.symbolDiamond, node)

        let svg_width = $("#svg_tree")[0].scrollWidth;
        let svg_height = $("#svg_tree")[0].scrollHeight;
        //计算当前的最值，用于设置比例尺
        let max_inner = d3.max(riverView.value_arr, d => d['inner']),
            max_interval = d3.max(riverView.value_arr, d => d['interval']),
            max_counts = d3.max(riverView.value_arr, d => d['clusterCounts'])

        let innerScale = d3.scaleLinear()
            .domain([0, max_inner])
            .range([0, 0.1 * svg_height])
        let intervalScale = d3.scaleLinear()
            .domain([0, max_interval])
            .range([0, 0.1 * svg_height])
        let countScale = d3.scaleLinear()
            .domain([0, max_counts])
            .range([0, 0.05 * svg_height])
        //占比高度比例尺
        let areaInitial = d3.area()
            .x(d => d.x)
            .y1(d => d.y)
            .y0(d => d.y0)
            .curve(d3.curveCatmullRom)
        let area_arr = [[], [], []];
        //计算坐标，类内流量位于上方，类间流量位于下方
        for (let i = 0; i < riverView.value_arr.length; i++) {
            let tmp_inner = {
                'type': 'inner',
                value: riverView.value_arr[i]['inner'],
                x: i * (svg_width * 0.7) / (tree_view.modifyCount - 1) + 10,
                y: 0.3 * svg_height - innerScale(riverView.value_arr[i]['inner']),
                y0: 0.3 * svg_height
            }, tmp_interval = {
                'type': 'interval',
                value: riverView.value_arr[i]['interval'],
                x: i * (svg_width * 0.7) / (tree_view.modifyCount - 1) + 10,
                y: tmp_inner.y - intervalScale(riverView.value_arr[i]['interval']),
                y0: tmp_inner.y
            }, tmp_counts = {
                'type': 'clusterCounts',
                value: riverView.value_arr[i]['clusterCounts'],
                x: i * (svg_width * 0.7) / (tree_view.modifyCount - 1) + 10,
                y: tmp_interval.y - countScale(riverView.value_arr[i]['clusterCounts']),
                y0: tmp_interval.y
            }
            area_arr[0].push(tmp_inner)
            area_arr[1].push(tmp_interval)
            area_arr[2].push(tmp_counts)
        }
        console.log('area_arr: ', area_arr);
        let river_color = ['#A7BEAD', '#8CAFB8', '#7B7C94']
        //修改三条path的路径
        riverView.river_g
            .attr('d', (d, i) => areaInitial(area_arr[i]))
            .attr('fill', (d, i) => river_color[i])
        console.log('riverView.river_g: ', riverView.river_g);

        //计算symbol的坐标和类型
        let symbol = [];
        for (let i = 1; i < riverView.value_arr.length; i++) {
            let tmp_dict = {
                symbol: riverView.value_arr[i].symbol,
                node: riverView.value_arr[i].node,
                x: i * (svg_width * 0.7) / (tree_view.modifyCount - 1) + 10,
                y: 0.02 * svg_height,
                cluster_arr: riverView.value_arr[i].cluster_arr
            };
            symbol.push(tmp_dict)
        }
        console.log('symbol: ', symbol);

        //新添加标志
        riverView.symbol_g.append('path')
            .attr('d', d3.symbol().type(symbol[symbol.length - 1].symbol).size(50))
            .attr('transform', `translate(${symbol[symbol.length - 1].x},${symbol[symbol.length - 1].y})`
            )
            .attr('fill', 'blue')

        //修改就标志的位置
        riverView.symbol_g.selectAll('path')
            .on('click', (d, i) => {
                //修改显示的指向线
                d3.selectAll('.directionLine').attr('opacity', 0.2)
                d3.select('#dirLine_' + i.toString())
                    .transition()
                    .duration(1000)
                    .attr('opacity', 1)
                //修改当前的类数组
                variable.cluster_arr = clusterFun.deepCopy(symbol[i].cluster_arr)
                console.log('symbol: ', symbol);
                //修改树图的选中节点显示
                variable.svg_tree.selectAll('.node')
                    .transition()
                    .duration(1000)
                    .attr('fill', colorOri.fill)
                    .attr('stroke', colorOri.stroke)
                for (let n = 0; n < variable.cluster_arr.length; n++) {
                    d3.select('#tree_' + variable.cluster_arr[n])
                        .transition()
                        .duration(1000)
                        .attr('fill', colorSelected.fill)
                        .attr('stroke', colorSelected.stroke)
                }

                //修改断层线
                //修改类断层的连线路径
                let faultage = [];
                for (let i = 0; i < variable.cluster_arr.length; i++) {
                    faultage.push(tree_view.cluLoc_dict[variable.cluster_arr[i]])
                }
                faultage.sort((a, b) => a[0] - b[0]);

                let falutageLine = d3.line()
                    .x(d => d[0])
                    .y(d => d[1])
                    .curve(d3.curveStep)
                tree_view.levelLine_g.selectAll('path')
                    .transition()
                    .duration(1000)
                    .attr('d', falutageLine(faultage))
            }).transition()
            .duration(2000)
            .attr('transform', (d, i) => {
                return `translate(${symbol[i].x},${symbol[i].y})`
            })

        //添加新指向线
        let dirLine_arr = []
        for (let i = 0; i < symbol.length; i++) {
            dirLine_arr.push([
                [symbol[i].x, symbol[i].y],
                [symbol[i].x, 0.32 * svg_height],
                [symbol[i].node.x, 0.32 * svg_height],
                [symbol[i].node.x, symbol[i].node.y]
            ])
        }

        let dirLine = d3.line()
            .x(d => d[0])
            .y(d => d[1])
        //添加新增操作的指向线
        riverView.directLine_g.append('path')
            .attr('d', dirLine(dirLine_arr[dirLine_arr.length - 1]))
            .attr('stroke', '#ff957c')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '4 4')
            .attr('fill', 'none')
            .attr('class', 'directionLine')
            .attr('id', 'dirLine_' + (dirLine_arr.length - 1).toString())
        //修改所有操作指向线的位置
        riverView.directLine_g.selectAll('path')
            .transition()
            .duration(2000)
            .attr('d', (d, i) => dirLine(dirLine_arr[i]))
            .attr('opacity', (d, i) => {
                if (i != dirLine_arr.length - 1)
                    return 0.2
                return 1
            })
        //修改类断层的连线路径
        let faultage = [];
        for (let i = 0; i < cluster_arr.length; i++) {
            faultage.push(tree_view.cluLoc_dict[cluster_arr[i]])

        }
        faultage.sort((a, b) => a[0] - b[0]);

        let falutageLine = d3.line()
            .x(d => d[0])
            .y(d => d[1])
            .curve(d3.curveStep)
        tree_view.levelLine_g.selectAll('path')
            .transition()
            .duration(1000)
            .attr('d', falutageLine(faultage))

    }

    function drawRiver(data, cluster_arr) {

        let svg_width = $("#svg_tree")[0].scrollWidth;
        let svg_height = $("#svg_tree")[0].scrollHeight;
        //每次更新数据是，都需要将value_arr清空
        riverView.value_arr = [];

        Cal(data, cluster_arr, null, null);
        riverView.clusterArr_record.push([]);
        //计算当前的最值，用于设置比例尺
        let max_inner = d3.max(riverView.value_arr, d => d['inner']),
            max_interval = d3.max(riverView.value_arr, d => d['interval']),
            max_counts = d3.max(riverView.value_arr, d => d['clusterCounts'])


        let innerScale = d3.scaleLinear()
            .domain([0, max_inner])
            .range([0, 0.1 * svg_height])
        let intervalScale = d3.scaleLinear()
            .domain([0, max_interval])
            .range([0, 0.1 * svg_height])
        let countScale = d3.scaleLinear()
            .domain([0, max_counts])
            .range([0, 0.05 * svg_height])
        //设置初始化
        let areaInitial = d3.area()
            .x(0)
            .y1(0)
            .y0(0.2 * svg_height)
        let area_arr = [[], [], []];
        // for (let i = 0; i < riverView.value_arr.length; i++) {
        //     area_arr[0].push({ 'type': 'inner', value: riverView.value_arr[i]['inner'] })
        //     area_arr[1].push({ 'type': 'interval', value: riverView.value_arr[i]['interval'] })

        // }
        console.log('area_arr: ', area_arr);

        let river_color = ['#A7BEAD', '#8CAFB8', '#7B7C94']

        riverView.river_g = variable.svg_tree.append('g').selectAll('path').data(area_arr).enter()
            .append('path')
            .attr('d', areaInitial)
            .attr('fill', (d, i) => river_color[i])


        //绘制比例尺
        let yAxis = [[10, 0.3 * svg_height], [10, 0.08 * svg_height]],
            xAxis = [[10, 0.3 * svg_height], [svg_width * 0.7 + 10, 0.3 * svg_height]]
        let axisLine = d3.line()
            .x(d => d[0])
            .y(d => d[1])
        variable.svg_tree.append('g').selectAll('path').data([xAxis, yAxis]).enter()
            .append('path')
            .attr('d', d => axisLine(d))
            .attr('stroke', '#999')
            .attr('stroke-width', 2)
            .attr('fill', 'none')

        //添加文字

        variable.svg_tree.append('text')
            .attr('x', 10)
            .attr('y', 0.05 * svg_height)
            .attr('color', 'gray')
            .attr('font-size', '0.7em')
            .style('text-anchor', 'start')
            .text('Energy')
        riverView.symbol_g = variable.svg_tree.append('g')
        riverView.directLine_g = variable.svg_tree.append('g')
        //添加图例
        let text_x = 0.8 * svg_width,
            y_space = 0.05 * svg_height,
            text_sy = 0.1 * svg_height,
            rect_sy = 0.070 * svg_height;
        let labels = ['Label Cost', 'Data Cost', 'Smooth Cost']
        variable.svg_tree.append('g').selectAll('text').data(labels).enter()
            .append('text')
            .attr('x', text_x)
            .attr('y', (d, i) => text_sy + i * y_space)
            .text(d => d)
            .attr('font-weight', 500)
            .attr('fill','#999')
            .attr('font-size', '0.9em')

        variable.svg_tree.append('g').selectAll('rect').data(labels).enter()
            .append('rect')
            .attr('x', text_x - 20)
            .attr('y', (d, i) => rect_sy + i * y_space)
            .attr('height', 15)
            .attr('width', 15)
            .attr('rx', 5)
            .attr('ry', 5)
            .attr('fill', (d, i) => river_color[i])
    }
    return {
        drawRiver,
        modifyRiver,
        value_arr,
        river_g, //河流path的g
        symbol_g, //标志的g
        directLine_g, //指向线的g
        clusterArr_record //记录每次操作的类数组
    }
})()