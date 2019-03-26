let tree_view = (function () {

    let svg_tree = d3.select('#svg_tree');
    let svg_width = $("#svg_tree")[0].scrollWidth;
    let svg_height = $("#svg_tree")[0].scrollHeight;
    function draw_tree(data) {
        svg_tree.selectAll('*').remove();
        let level_dict = data['level_dict'], children_dict = data['children_dict'];
        let max_level = d3.max(Object.keys(data['level_dict']), d => parseInt(d))
        let top_node = level_dict[max_level][0];
        function getChildren(node) {
            let tmp_dict = { name: node };
            if (parseInt(children_dict[node]['level']) > 1) {
                tmp_dict['children'] = [];
                tmp_dict['children'].push(getChildren(children_dict[node]['left']))
                if (children_dict[node]['right']) {
                    tmp_dict['children'].push(getChildren(children_dict[node]['right']))
                }
            }
            return tmp_dict;
        }

        let iter_data = getChildren(top_node)
        let hierarchyData = d3.hierarchy(iter_data).sum(d => d.value ? 1 : 0);
        let tree = d3.tree()
            .size([svg_width - 20, svg_height - 20]);
        let treeData = tree(hierarchyData);
        let nodes = treeData.descendants();
        console.log('nodes: ', nodes);

        let links = treeData.links();

        let g = svg_tree.append('g').attr('transform', 'translate(10,10)')
        g.selectAll('.link').data(links).enter()
            .append('path')
            .attr('class', 'link')
            .attr('d', d3.linkVertical()
                .x(function (d) { return d.x; })
                .y(function (d) { return d.y; }))
            .attr('stroke', '#b1b1b1')
            .attr('stroke-width', 1.5)
            .attr('fill', 'none')
        g.selectAll('.node').data(nodes).enter()
            .append('circle')
            .attr('class', 'node')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', 3)
            .attr('fill', '#B6E9FF')
            .attr('stroke', '#329CCB')
            .attr('stroke-width', 1)
            .attr('id', d=>'tree_' + d.data.name)
            .on('click',function(d){
                if (variable.last_cluster != undefined){
                    d3.select('#area_' + variable.last_cluster).attr('fill', '#D5E2FF');
                    d3.select('#cluster_' + variable.last_cluster).attr('fill', '#329CCB');
                    d3.select('#tree_' + variable.last_cluster).attr('fill', '#B6E9FF').attr('stroke', '#329CCB')
                }
                d3.select('#area_' + d.id).attr('fill', '#FF9519');
                d3.select('#cluster_' + d.id).attr('fill', '#FF9519');
                d3.select('#tree_' + d.id).attr('fill', '#FFC889').attr('stroke', '#FF9519')
            })

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
        level_line.sort((a, b)=>a[0] - b[0])
        console.log('level_line: ', level_line);
        let line = d3.line()
            .x(d => d[0])
            .y(d => d[1])
        svg_tree
            .append('path')
            .attr('d',line(level_line))
            .attr('stroke','red')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray','4 4')
            .attr('transform', 'translate(10,10)')
    }


    return {
        draw_tree
    }
})()