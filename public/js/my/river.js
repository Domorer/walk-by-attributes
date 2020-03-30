let riverView = (function () {
    let value_arr = [],
        river_g, clusterArr_record = [];
    let symbol_g, directLine_g;

    function Cal(data, cluster_arr, symbol, node) {

        let children_dict = data['children_dict']
        //各个类间连线的流量总和、各个类的选中属性的 类内流量占比 之和, 统计数值数组
        let value_dict = {
            'sc': 0,
            'ah': 0,
            'ts': 0
        };
        //遍历树，获取当前节点所连的所有末端节点的集合
        let dfs = function (root) {
            var arr = [],
                res = [];
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

        //***计算每个簇内的所有连线的字典*****
        let clu_tpg = {};
        //使用字典对比法
        for (let key in cluster_ids_dict) {
            clu_tpg[key] = [];
            for (let i = 0; i < cluster_ids_dict[key].length; i++) {
                if (variable.oriLink_dict[cluster_ids_dict[key][i]] != null) {
                    let tmp_targets = variable.oriLink_dict[cluster_ids_dict[key][i]];
                    for (let j = 0; j < tmp_targets.length; j++) {
                        if (cluster_ids_dict[key].indexOf(tmp_targets[j]) != -1) {
                            // let tmp_value = variable.period_dict[cluster_ids_dict[key][i] + '_' + tmp_targets[j]]
                            let tmp_value = 1
                            clu_tpg[key].push({
                                'source': cluster_ids_dict[key][i],
                                'target': tmp_targets[j],
                                value: tmp_value
                            })
                        }
                    }
                }
            }
        }

        //计算一下
        let innerLinks_count = 0
        //计算所有类内连边的数量
        for (let key in clu_tpg) {
            innerLinks_count += clu_tpg[key].length
        }
        //计算每个聚类当前属性的信息熵
        let nodeCounts = 0;
        for (let clu in cluster_ids_dict)
            nodeCounts += cluster_ids_dict[clu].length
        let entropy_sum = 0,
            tmp_attr_arr = variable.attr.split('')
        for (let clu in cluster_ids_dict) {
            //计算一个类各属性的信息熵之和
            for (let i = 0; i < variable.type_count; i++) {
                //计算该类某属性的信息熵，返回值已经加了负号
                let tmp_entropy = forceChart.calEntropy(clu, tmp_attr_arr[i], cluster_ids_dict)
                entropy_sum += tmp_entropy * (cluster_ids_dict[clu].length / nodeCounts)
            }
        }
        //参数一
        let structure_closeness = variable.w1 * (1 - innerLinks_count / variable.oriLinks.length)
        //参数二
        let attr_homogeneity = entropy_sum * variable.w2 / variable.type_count
        //参数三
        let tree_structure = variable.w3 * cluster_arr.length
        //最终值
        let finalValue = structure_closeness + attr_homogeneity + tree_structure



        value_dict['sc'] = structure_closeness //w1
        value_dict['ah'] = attr_homogeneity // w2
        value_dict['ts'] = tree_structure // w3
        value_dict['symbol'] = symbol; //保存本次操作的标志
        value_dict['node'] = node; //保存操作的节点ID
        value_dict['cluster_arr'] = clusterFun.deepCopy(cluster_arr); //保存本次操作结果的cluster_arr
        return value_dict
    }

    function modifyRiver(data, cluster_arr, separate, node, treeClick, initial) {
        let colorSelected = {
                fill: '#ff957c',
                stroke: '#ff4416'
            },
            colorOri = {
                fill: '#B6E9FF',
                stroke: '#329CCB'
            }
        console.log('cluster_arr: ', cluster_arr);
        //将当前的类数组存入record
        /* 判断当前修改河流图是由点击层次树引起的还是点击em按钮引起的
            1.点击层次树引起的： 需要在河流图上增加
            2. em按钮默认连接到顶点
         */

        riverView.clusterArr_record.push(cluster_arr);
        if (!separate && treeClick && !initial)
            riverView.value_arr.push(Cal(data, cluster_arr, d3.symbolCross, node))
        else if (separate && treeClick && !initial)
            riverView.value_arr.push(Cal(data, cluster_arr, d3.symbolDiamond, node))
        else if (initial)
            riverView.value_arr.push(Cal(data, cluster_arr, d3.symbolCircle, node))
        else
            riverView.value_arr.push(Cal(data, cluster_arr, d3.symbolStar, node))



        let svg_width = $("#svg_tree")[0].scrollWidth;
        let svg_height = $("#svg_tree")[0].scrollHeight;
        let riverHeight = 0.25 * svg_height
        //计算当前的最值，用于设置比例尺
        let max_inner = d3.max(riverView.value_arr, d => d['sc']),
            max_interval = d3.max(riverView.value_arr, d => d['ah']),
            max_counts = d3.max(riverView.value_arr, d => d['ts']),
            maxValue = d3.max([max_inner, max_interval, max_counts])

        // let innerScale = d3.scaleLinear()
        //     .domain([0, max_inner])
        //     .range([0, 0.05 * svg_height])
        // let intervalScale = d3.scaleLinear()
        //     .domain([0, max_interval])
        //     .range([0, 0.05 * svg_height])
        // let countScale = d3.scaleLinear()
        //     .domain([0, max_counts])
        //     .range([0, 0.05 * svg_height])

        let valueScale = d3.scaleLinear()
            .domain([0, maxValue])
            .range([0, 0.08 * svg_height])
        //占比高度比例尺
        let areaInitial = d3.area()
            .x(d => d.x)
            .y1(d => d.y)
            .y0(d => d.y0)
            .curve(d3.curveCatmullRom)
        let area_arr = [
            [],
            [],
            []
        ];
        //计算坐标，从下到上 w3  w2  w1
        for (let i = 0; i < riverView.value_arr.length; i++) {
            let tmp_inner = {
                    'type': 'sc',
                    value: riverView.value_arr[i]['sc'],
                    x: i * (svg_width * 0.8) / (tree_view.modifyCount - 1) + 10,
                    y: riverHeight - valueScale(riverView.value_arr[i]['sc']),
                    y0: riverHeight
                },
                tmp_interval = {
                    'type': 'ah',
                    value: riverView.value_arr[i]['ah'],
                    x: i * (svg_width * 0.8) / (tree_view.modifyCount - 1) + 10,
                    y: tmp_inner.y - valueScale(riverView.value_arr[i]['ah']),
                    y0: tmp_inner.y
                },
                tmp_counts = {
                    'type': 'ts',
                    value: riverView.value_arr[i]['ts'],
                    x: i * (svg_width * 0.8) / (tree_view.modifyCount - 1) + 10,
                    y: tmp_interval.y - valueScale(riverView.value_arr[i]['ts']),
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
                'symbol': riverView.value_arr[i].symbol,
                'node': riverView.value_arr[i].node,
                'x': i * (svg_width * 0.8) / (tree_view.modifyCount - 1) + 10,
                'y': 0.10 * svg_height,
                'cluster_arr': riverView.value_arr[i].cluster_arr
            };
            symbol.push(tmp_dict)
        }
        console.log('symbol: ', symbol);

        //新添加标志
        riverView.symbol_g.append('path')
            .attr('d', d3.symbol().type(symbol[symbol.length - 1].symbol).size(50))
            .attr('transform', `translate(${symbol[symbol.length - 1].x},${symbol[symbol.length - 1].y})`)
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
                    .attr('fill', colorOri.stroke)
                // .attr('stroke', colorOri.stroke)
                for (let n = 0; n < variable.cluster_arr.length; n++) {
                    d3.select('#tree_' + variable.cluster_arr[n])
                        .transition()
                        .duration(1000)
                        .attr('fill', colorSelected.stroke)
                    // .attr('stroke', colorSelected.stroke)
                }


                //修改类断层的连线路径
                let faultage = [];
                for (let j = 0; j < variable.cluster_arr.length; j++) {
                    let tmp_node = tree_view.tree_nodes_dict[variable.cluster_arr[j]]
                    faultage.push([tmp_node.x, tmp_node.y])
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
                [symbol[i].x, 0.27 * svg_height],
                [symbol[i].node.x, 0.27 * svg_height],
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
            let tmp_node = tree_view.tree_nodes_dict[variable.cluster_arr[i]]
            faultage.push([tmp_node.x, tmp_node.y])

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
        let riverHeight = 0.25 * svg_height
        //每次更新数据是，都需要将value_arr清空
        riverView.value_arr = [];

        riverView.value_arr.push(Cal(data, cluster_arr, null, null));
        riverView.clusterArr_record.push([]);
        //计算当前的最值，用于设置比例尺
        let max_inner = d3.max(riverView.value_arr, d => d['sc']),
            max_interval = d3.max(riverView.value_arr, d => d['sh']),
            max_counts = d3.max(riverView.value_arr, d => d['ts'])


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
        let area_arr = [
            [],
            [],
            []
        ];
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
        let yAxis = [
                [10, riverHeight],
                [10, 0.12 * svg_height]
            ],
            xAxis = [
                [10, riverHeight],
                [svg_width * 0.8 + 10, riverHeight]
            ]
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
            .attr('y', 0.10 * svg_height)
            .attr('color', 'gray')
            .attr('font-size', '0.7em')
            .style('text-anchor', 'start')
            .text('Energy')
        riverView.symbol_g = variable.svg_tree.append('g')
        riverView.directLine_g = variable.svg_tree.append('g')
        //添加图例
        let text_x = 0.93 * svg_width,
            y_space = 0.05 * svg_height,
            text_sy = 0.10 * svg_height,
            rect_sy = 0.10 * svg_height;
        let labels = ['SC', 'AH', 'TS']
        variable.svg_tree.append('g').selectAll('text').data(labels).enter()
            .append('text')
            .attr('x', text_x)
            .attr('y', (d, i) => text_sy + i * y_space + 10)
            .text(d => d)
            .attr('font-weight', 500)
            .attr('fill', '#999')
            .attr('font-size', '0.8em')

        variable.svg_tree.append('g').selectAll('rect').data(labels).enter()
            .append('rect')
            .attr('x', text_x - 20)
            .attr('y', (d, i) => rect_sy + i * y_space)
            .attr('height', 12)
            .attr('width', 12)
            .attr('rx', 2.4)
            .attr('ry', 2.4)
            .attr('fill', (d, i) => river_color[2 - i])
    }


    return {
        drawRiver,
        modifyRiver,
        Cal,
        value_arr,
        river_g, //河流path的g
        symbol_g, //标志的g
        directLine_g, //指向线的g
        clusterArr_record //记录每次操作的类数组
    }
})()