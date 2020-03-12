let tree_view = (function () {
    let modifyCount = 1,
        levelLine_g, cluLoc_dict = {},
        tree_nodes_dict = {}

    function draw_tree(data, level) {
        let colorSelected = {
                fill: '#ff957c',
                stroke: '#ff4416'
            },
            colorOri = {
                fill: '#B6E9FF',
                stroke: '#329CCB'
            }
        let svg_tree = d3.select('#svg_tree');
        let svg_width = $("#svg_tree")[0].scrollWidth;
        let svg_height = $("#svg_tree")[0].scrollHeight;
        let transformHeight = 0.32 * svg_height
        svg_tree.selectAll('*').remove();

        let level_dict = data['level_dict'],
            children_dict = data['children_dict'];
        let max_level = d3.max(Object.keys(data['level_dict']), d => parseInt(d))
        console.log('max_level: ', max_level);
        let top_node = level_dict[max_level][0];



        let iter_data = getChildrenTree(top_node)
        let hierarchyData = d3.hierarchy(iter_data).sum(d => d.value ? 1 : 0);
        let tree = d3.tree()
            .size([svg_width - 20, 0.5 * svg_height]);

        //获取数据结构字典数据，最高层为最外层数据
        let treeData = tree(hierarchyData);

        //获取节点和树的数据
        let nodes = treeData.descendants();
        //获取类坐标字典
        // tree_view.cluLoc_dict = {}
        tree_view.tree_nodes_dict = {}
        for (let i = 0; i < nodes.length; i++) {
            // tree_view.cluLoc_dict[nodes[i].data.name] = [nodes[i].x, nodes[i].y]
            tree_view.tree_nodes_dict[nodes[i].data.name] = nodes[i]
        }
        console.log('nodes: ', nodes);
        let links = treeData.links();
        //设置线宽、透明度、圆半径的比例尺
        let LWScale = d3.scaleLinear().domain([0, treeData.height]).range([2, 3])
        let OPScale = d3.scaleLinear().domain([0, treeData.height]).range([0.5, 1])
        let RScale = d3.scaleLinear().domain([0, treeData.height]).range([2.5, 5])
        let g = svg_tree.append('g').attr('transform', `translate(10,${transformHeight})`)
        g.selectAll('.link').data(links).enter()
            .append('path')
            .attr('class', 'link')
            .attr('d', d3.linkVertical()
                .x(function (d) {
                    return d.x;
                })
                .y(function (d) {
                    return d.y;
                }))
            .attr('stroke', '#b1b1b1')
            .attr('stroke-width', d => LWScale(d.source.height))
            .attr('opacity', d => OPScale(d.source.height))
            .attr('fill', 'none')
        g.selectAll('.node').data(nodes).enter()
            .append('circle')
            .attr('class', 'node')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', d => RScale(d.height))
            .attr('fill', d => {
                if (level_dict[variable.level].indexOf(d.data.name) != -1)
                    return colorSelected.stroke
                return colorOri.stroke
            })
            // .attr('stroke', d => {
            //     if (level_dict[variable.level].indexOf(d.data.name) != -1)
            //         return colorSelected.stroke
            //     return colorOri.stroke
            // })
            // .attr('stroke-width', d => LWScale(d.height))
            .attr('id', d => 'tree_' + d.data.name)
            .on('click', function (d) {
                // console.log('d: ', d);
                tree_view.modifyCount += 1

                let parent = [],
                    children = [],
                    separate;
                parent = getParents(d);
                console.log("functiondraw_tree -> parent", parent)
                console.log('parent: ', parent);
                children = getChildren(children_dict[d.data.name]);
                children.splice(0, 1)
                console.log('children: ', children);
                //如果选中切层中的子节点,则删除该节点，并将该节点的子节点 都 加入切层类数组
                let tmp_parentId;
                //先判断该节点向上走过程中是不是有一个父节点处于当前的cluster中，若是，则进行分割操作，不是则进行合并
                for (let p = 0; p < parent.length; p++) {
                    if (variable.cluster_arr.indexOf(parent[p]) != -1) {
                        //当前操作代表切割
                        separate = true;
                        console.log('separate: ', separate);
                        //删除类数组中的父节点
                        variable.cluster_arr.splice(variable.cluster_arr.indexOf(parent[p]), 1);
                        d3.select('#tree_' + parent[p])
                            .transition()
                            .duration(1000)
                            .attr('fill', colorOri.stroke)
                        // .attr('stroke', colorOri.stroke)
                        tmp_parentId = parent[p];
                    }
                }


                if (separate == true) {
                    //*************分割操作*********************
                    //获取该节点 在当前切层中的父节点  的所有子节点
                    let parent_childrens = getChildren(children_dict[tmp_parentId])
                    console.log('parent_childrens: ', parent_childrens);
                    /*d.height代表的是层次树的可见高度是第几层，并不是实际上的层次level，所以在获取指定层的点时，需要加上层次树开始可见的level
                        获取当前节点的同一层节点
                    */
                    let levelIds = level_dict[d.height + level];
                    console.log("functiondraw_tree -> levelIds", levelIds)
                    console.log("functiondraw_tree -> d.height", d.height)
                    console.log('levelIds: ', levelIds);

                    for (let i = 0; i < levelIds.length; i++) {
                        if (parent_childrens.indexOf(levelIds[i]) != -1) {
                            d3.select('#tree_' + levelIds[i])
                                .transition()
                                .duration(1000)
                                .attr('fill', colorSelected.stroke)
                            // .attr('stroke', colorSelected.stroke)
                            variable.cluster_arr.push(levelIds[i]);
                        }
                    }
                } else {
                    //*************合并操作***************
                    for (let c = 0; c < children.length; c++) {
                        //如果子节点已经存在类数组，则删除
                        if (variable.cluster_arr.indexOf(children[c]) != -1) {
                            //当前操作代表合并
                            separate = false;
                            console.log('separate: ', separate);
                            variable.cluster_arr.splice(variable.cluster_arr.indexOf(children[c]), 1);
                            d3.select('#tree_' + children[c])
                                .transition()
                                .duration(1000)
                                .attr('fill', colorOri.stroke)
                            // .attr('stroke', colorOri.stroke)
                        }
                    }
                    //如果当前操作属于合并，则将当前节点加入类数组
                    d3.select('#tree_' + d.data.name)
                        .transition()
                        .duration(1000)
                        .attr('fill', colorSelected.stroke)
                    // .attr('stroke', colorSelected.stroke)
                    variable.cluster_arr.push(d.data.name);
                }

                console.log('variable.cluster_arr: ', variable.cluster_arr);
                console.log('separate: ', separate);
                let tmp_info = {
                    name: d.data.name,
                    x: d.x + 10,
                    y: d.y + transformHeight
                };
                riverView.modifyRiver(data, variable.cluster_arr, separate, tmp_info)
            })

        //*******初始化河流图************
        riverView.drawRiver(data, level_dict[variable.level])
        //绘制断层线
        let nodeLoc_dict = {}
        for (let i = 0; i < nodes.length; i++) {
            nodeLoc_dict[nodes[i].data.name] = [nodes[i].x, nodes[i].y];
        }
        let level_line = [];
        console.log('level_dict: ', level_dict);
        console.log(variable.level);
        for (let i = 0; i < level_dict[variable.level].length; i++) {

            level_line.push(nodeLoc_dict[level_dict[variable.level][i]]);
        }
        level_line.sort((a, b) => a[0] - b[0])
        console.log('level_line: ', level_line);
        let line = d3.line()
            .x(d => d[0])
            .y(d => d[1])
        tree_view.levelLine_g = svg_tree.append('g')
        tree_view.levelLine_g.append('path')
            .attr('d', line(level_line))
            .style('stroke', 'gray')
            .style('fill', 'none')
            .style('stroke-opacity', .5)
            .style('stroke-width', 2)
            .style('stroke-dasharray', '4 4')
            .attr('transform', `translate(10,${transformHeight})`)


        //**********画最底层的矩形*****************
        let groundFloorClusterNumbers = data['level_dict'][level].length,
            rects = [],
            max_Value = -Infinity //点数最多的情况，以此来限制矩形高度

        //判断是否为多属性，若是，则需要修改值计算方式
        let line_arr = [],
            xIndex = 0, //在此处记录连线的起点，即树底层节点的坐标
            tmp_color_arr;
        if (variable.type_count == 1) {
            tmp_color_arr = variable.valueColor_dict[variable.attr]
            for (let i = nodes.length - groundFloorClusterNumbers; i < nodes.length; i++) {
                let tmp_line = [
                    [nodes[i].x, nodes[i].y]
                ]
                line_arr.push(tmp_line)
                let tmp_value_arr = calAttrValueNodes(nodes[i].data['name'])
                for (let j = 0; j < variable.attrValue_dict[variable.attr].length; j++) {
                    let tmp_rect = {
                        'x': nodes[i].x,
                        'y': nodes[i].y + 0.13 * svg_height,
                        'id': nodes[i].data['name'],
                        'key': variable.attrValue_dict[variable.attr][j],
                        'value_arr': tmp_value_arr,
                        'yIndex': j, //读取对应属性值
                        'xIndex': xIndex, //保存横向序号
                        'cIndex': j
                    }
                    if (tmp_value_arr[j] > max_Value)
                        max_Value = tmp_value_arr[j]
                    rects.push(tmp_rect)
                }
                xIndex += 1
            }
        } else {
            tmp_color_arr = variable.attr_color
            for (let i = nodes.length - groundFloorClusterNumbers; i < nodes.length; i++) {
                let tmp_line = [
                    [nodes[i].x, nodes[i].y]
                ]
                line_arr.push(tmp_line)
                let tmp_attr_arr = variable.attr.split(''),
                    tmp_value_arr = []
                for (let j = 0; j < variable.type_count; j++) {
                    let tmp_entropy = forceChart.calEntropy(nodes[i].data['name'], tmp_attr_arr[j], variable.cluster_ids_dict)
                    tmp_value_arr.push(tmp_entropy)
                    if (tmp_entropy > max_Value)
                        max_Value = tmp_value_arr[j]
                }
                for (let j = 0; j < variable.type_count; j++) {
                    let tmp_rect = {
                        'x': nodes[i].x,
                        'y': nodes[i].y + 0.13 * svg_height,
                        'id': nodes[i].data['name'],
                        'key': tmp_attr_arr[j],
                        'value_arr': tmp_value_arr,
                        'yIndex': j, //读取对应属性的index
                        'xIndex': xIndex, //保存横向序号
                        'cIndex': parseInt(tmp_attr_arr[j] - 1)
                    }
                    rects.push(tmp_rect)
                }
                xIndex += 1
            }
        }
        console.log("functiondraw_tree -> line_arr", line_arr)

        //属性值举行的最大高度不超过 0.12*svg_height 的三分之一
        let heightScale = d3.scaleLinear().domain([0, max_Value]).range([0, 0.06 * svg_height])
        console.log("functiondraw_tree -> rects", rects)

        svg_tree.append('g').selectAll('rect').data(rects).enter()
            .append('rect')
            .attr('x', d => d.x - 2)
            .attr('y', (d, i) => {
                //计算之前属性值矩形的总高度
                let tmpHeight = 0
                for (let i_ = 0; i_ <= d.yIndex; i_++) {
                    tmpHeight += heightScale(d.value_arr[i_])
                }
                if (d.yIndex == d.value_arr.length - 1)
                    line_arr[d.xIndex].push([d.x, d.y - tmpHeight])
                return d.y - tmpHeight
            })
            .attr('height', d => {
                return heightScale(d.value_arr[d.yIndex])
            })
            .attr('width', 4)
            .style('fill', (d, i) => {
                return tmp_color_arr[d.cIndex]
            })
            .attr('transform', `translate(10,${transformHeight})`)
            .attr('id', d => 'rect_' + d.id + '_' + d.key)
        console.log("functiondraw_tree -> rects", rects)
        /*画底层节点与底层矩形的连线 */
        console.log("functiondraw_tree -> line_arr", line_arr)

        svg_tree.append('g').selectAll('path').data(line_arr).enter()
            .append('path')
            .attr('d', d => line(d))
            .style('fill', 'none')
            .style('stroke', '#b1b1b1')
            .style('stroke-width', 2)
            .style('stroke-opacity', .5)
            .attr('transform', `translate(10,${transformHeight})`)
    }



    function getChildrenTree(node) {
        let tmp_dict = {
            name: node
        };
        if (parseInt(variable.comb_data['children_dict'][node]['level']) > variable.level) {
            tmp_dict['children'] = [];
            tmp_dict['children'].push(getChildrenTree(variable.comb_data['children_dict'][node]['left']))
            if (variable.comb_data['children_dict'][node]['right']) {
                tmp_dict['children'].push(getChildrenTree(variable.comb_data['children_dict'][node]['right']))
            }
        }
        return tmp_dict;
    }


    let getChildren = function (root) {
        var arr = [],
            res = [];
        if (root != null) {
            arr.push(root);
        }
        while (arr.length != 0) {
            var temp = arr.pop();
            res.push(temp.id);
            //这里先放右边再放左边是因为取出来的顺序相反
            if (temp.right != null) {
                arr.push(variable.comb_data['children_dict'][temp.right]);
            }
            if (temp.left != null) {
                arr.push(variable.comb_data['children_dict'][temp.left]);
            }
        }
        return res;
    }


    let getParents = function (root) {
        var arr = [],
            res = [];
        if (root.parent != null) {
            arr.push(root.parent);
        }
        while (arr.length != 0) {
            var temp = arr.pop();
            res.push(temp.data.name);
            if (temp.parent != null)
                arr.push(temp.parent);
        }
        return res;
    }


    function calAttrValueNodes(cluster) {
        let attrs_value = new Array()
        //单属性时，variable.attr 就是属性名称，不是多个属性名称的集合
        let value_dict = {};
        for (let i = 0; i < variable.attrValue_dict[variable.attr].length; i++) {
            value_dict[variable.attrValue_dict[variable.attr][i]] = 0
        }
        //遍历当前类内的点，并统计各个属性值都包含几个点
        let tmp_ids = variable.cluster_ids_dict[cluster];

        for (let i = 0; i < tmp_ids.length; i++) {
            let tmp_value = variable.nodeInfo[tmp_ids[i]][variable.attr];
            value_dict[tmp_value] += 1;
        }
        for (let key in value_dict) {
            // console.log(key)
            attrs_value.push(value_dict[key]);
        }
        return attrs_value
    }

    function generateRandomFaultage(cluster_arr) {
        let level_cluster_arr = []
        console.log('**********************')
        while (cluster_arr.length > 0) {
            let tmp_cluster = cluster_arr[parseInt(Math.random() * cluster_arr.length)]
            let tmp_parents = getParents(tree_view.tree_nodes_dict[tmp_cluster]),
                tmp_children = getChildren(tree_view.tree_nodes_dict[tmp_cluster])
            //随机获取一个点之后，删除该点的所有父亲节点和子节点
            for (let i = 0; i < tmp_parents.length; i++) {
                let tmp_index = cluster_arr.findIndex(Element => Element == tmp_children[i])
                cluster_arr.splice(tmp_index, 1)
            }
            for (let i = 0; i < tmp_children.length; i++) {
                let tmp_index = cluster_arr.findIndex(Element => Element == tmp_children[i])
                cluster_arr.splice(tmp_index, 1)
            }
            level_cluster_arr.push(tmp_cluster)
        }
        return level_cluster_arr
    }

    return {
        draw_tree,
        generateRandomFaultage,
        modifyCount,
        levelLine_g,
        cluLoc_dict,
        tree_nodes_dict,
    }
})()