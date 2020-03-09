let tree_view = (function () {
    let modifyCount = 1, levelLine_g, cluLoc_dict = {};

    function draw_tree(data, level) {
        let colorSelected = { fill: '#ff957c', stroke: '#ff4416' }, colorOri = { fill: '#B6E9FF', stroke: '#329CCB' }
        let svg_tree = d3.select('#svg_tree');
        let svg_width = $("#svg_tree")[0].scrollWidth;
        let svg_height = $("#svg_tree")[0].scrollHeight;
        svg_tree.selectAll('*').remove();

        let level_dict = data['level_dict'], children_dict = data['children_dict'];
        let max_level = d3.max(Object.keys(data['level_dict']), d => parseInt(d))
        console.log('max_level: ', max_level);
        let top_node = level_dict[max_level][0];
        function getChildren(node) {
            let tmp_dict = { name: node };
            if (parseInt(children_dict[node]['level']) > level) {
                tmp_dict['children'] = [];
                tmp_dict['children'].push(getChildren(children_dict[node]['left']))
                if (children_dict[node]['right']) {
                    tmp_dict['children'].push(getChildren(children_dict[node]['right']))
                }
            }
            return tmp_dict;
        }
        let judgeChildren = function (root) {
            var arr = [], res = [];
            if (root != null) {
                arr.push(root);
            }
            while (arr.length != 0) {
                var temp = arr.pop();
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
        let judgeParent = function (root) {
            var arr = [], res = [];
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


        let iter_data = getChildren(top_node)
        let hierarchyData = d3.hierarchy(iter_data).sum(d => d.value ? 1 : 0);
        let tree = d3.tree()
            .size([svg_width - 20, 0.45 * svg_height]);

        //获取数据结构字典数据，最高层为最外层数据
        let treeData = tree(hierarchyData);

        //获取节点和树的数据
        let nodes = treeData.descendants();
        //获取类坐标字典
        tree_view.cluLoc_dict = {}
        for (let i = 0; i < nodes.length; i++) {
            tree_view.cluLoc_dict[nodes[i].data.name] = [nodes[i].x, nodes[i].y]
        }
        console.log('nodes: ', nodes);
        let links = treeData.links();
        //设置线宽、透明度、圆半径的比例尺
        let LWScale = d3.scaleLinear().domain([0, treeData.height]).range([2, 3])
        let OPScale = d3.scaleLinear().domain([0, treeData.height]).range([0.5, 1])
        let RScale = d3.scaleLinear().domain([0, treeData.height]).range([2.5, 5])
        let g = svg_tree.append('g').attr('transform', `translate(10,${0.37 * svg_height})`)
        g.selectAll('.link').data(links).enter()
            .append('path')
            .attr('class', 'link')
            .attr('d', d3.linkVertical()
                .x(function (d) { return d.x; })
                .y(function (d) { return d.y; }))
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

                let parent = [], children = [], separate;
                parent = judgeParent(d);
                console.log('parent: ', parent);
                children = judgeChildren(children_dict[d.data.name]);
                children.splice(0, 1)
                console.log('children: ', children);
                //如果选中切层中的子节点,则删除该节点，并将该节点的子节点 都 加入切层类数组
                let tmp_parentId;
                //先判断该节点网上走过程中是不是又一个父节点处于当前的cluster中，若是，则进行分割操作，不是则进行合并
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
                    //将当前节点的父节点的所有下一层子节点加入类数组
                    let parent_childrens = judgeChildren(children_dict[tmp_parentId])
                    console.log('parent_childrens: ', parent_childrens);
                    //d.height代表的是层次树的可见高度是第几层，并不是实际上的层次level，所以在获取指定层的点时，需要加上层次树开始可见的level
                    let levelIds = level_dict[d.height +  level];
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
                }

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
                if (separate == false) {
                    d3.select('#tree_' + d.data.name)
                        .transition()
                        .duration(1000)
                        .attr('fill', colorSelected.stroke)
                        // .attr('stroke', colorSelected.stroke)
                    variable.cluster_arr.push(d.data.name);

                }
                console.log('variable.cluster_arr: ', variable.cluster_arr);
                console.log('separate: ', separate);
                let tmp_info = { name: d.data.name, x: d.x + 10, y: d.y + 0.37 * svg_height };
                riverView.modifyRiver(data, variable.cluster_arr, separate, tmp_info)
                
                

            })

        //初始化河流图
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
            .style('fill','none')
            .style('stroke-opacity', .5)
            .style('stroke-width', 2)
            .style('stroke-dasharray', '4 4')
            .attr('transform', `translate(10,${0.37 * svg_height})`)
    }

    //通过判断节点的children来确定当前选中的类
    // variable.cluster_arr = [];
    // for (let i = 0; i < nodes.length; i++) {
    //     if (nodes[i].children == null)
    //         variable.cluster_arr.push(nodes[i].data.name);
    // }



    return {
        draw_tree,
        modifyCount,
        levelLine_g,
        cluLoc_dict
    }
})()