let tree_view = (function () {

    let svg_tree = d3.select('#svg_tree');
    let svg_width = $("#svg_tree")[0].scrollWidth;
    let svg_height = $("#svg_tree")[0].scrollHeight;
    console.log('svg_height: ', svg_height);
    function draw_tree(data, show_level) {

        console.log('data: ', data);
        
        let level_dict = data['level_dict'];
        let children_dict = data['children_dict'];
        let max_level = d3.max(Object.keys(level_dict), d => parseInt(d));
        console.log('max_level: ', max_level);
        let start_level = max_level - show_level + 1;
        for (let key in level_dict) {
            if (key >= start_level) {
                let leaf = svg_tree.append('g').selectAll('circle').data(level_dict[key]).enter()
                    .append('circle')
                    .attr('cy', function (d) {
                        children_dict[d].y = (max_level - key + 0.5) * svg_height / show_level;
                        return children_dict[d].y;
                    })
                    .attr('r', 1)
                    .attr('fill', 'gray');
                if (key == start_level) {
                    leaf.attr('cx', function (d, i) {
                        children_dict[d].x = (i + 0.5) * svg_width / level_dict[key].length;
                        return (i + 0.5) * svg_width / level_dict[key].length
                    })
                } else {
                    leaf.attr('cx', function (d, i) {
                        let tmp_x, tmp_children = children_dict[d]['children'];
                        if(tmp_children.length > 1){
                            tmp_x = (children_dict[tmp_children[0]].x + children_dict[tmp_children[1]].x) / 2;
                            children_dict[d].x = tmp_x;
                        }else{
                            tmp_x = children_dict[tmp_children[0]].x
                        }
                        
                        return tmp_x
                    })
                }
            }

        }

        let branchs = [];

        for (let key in children_dict) {
            if (children_dict[key].children.length > 1 && children_dict[key].level >= start_level) {
                let children = children_dict[key].children;
                branchs.push([children_dict[children[0]], children_dict[key]]);
                branchs.push([children_dict[children[1]], children_dict[key]]);

            }
        }
        console.log('branchs: ', branchs);
        let line = d3.line()
            .x(function (d) { return d.x })
            .y(function (d) { return d.y })
            .curve(d3.curveBasis)

        svg_tree.append('g').selectAll('path').data(branchs).enter()
            .append('path')
            .attr('d', d => line(d))
            .attr('stroke', 'gray')
            .attr('stroke-width', 3)

    }

    return {
        draw_tree
    }
})()