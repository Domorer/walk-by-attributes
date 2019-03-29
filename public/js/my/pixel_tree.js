let tree_view = (function () {
    let modifyCount = 1;

    function draw_tree(data, level) {


        let svg_width = $("#svg_tree")[0].scrollWidth;
        let svg_height = $("#svg_tree")[0].scrollHeight;
        let svg_tree = d3.select('#svg_tree');

        svg_tree.selectAll('*').remove();
        let level_dict = data['level_dict'], children_dict = data['children_dict'];
        let max_level = d3.max(Object.keys(data['level_dict']), d => parseInt(d))
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
        //初始化河流图
        riverView.drawRiver(data, data['level_dict'][level]);

        let diagonal = d3.linkVertical().x(d => d.x).y(d => d.y);
        let iter_data = getChildren(top_node)
        let margin = { top: 10, right: 10, bottom: 10, left: 10 };

        const root = d3.hierarchy(iter_data);
        const dy = 100;
        root.x0 = dy / 2;
        root.y0 = 0;
        root.descendants().forEach((d, i) => {
            d.id = i;
            d._children = d.children;
        });
        let tree = d3.tree()
            .size([svg_width - 20, svg_height * 0.6]);


        const gLink = svg_tree.append("g")
            .attr("fill", "none")
            .attr("stroke", "#555")
            .attr("stroke-opacity", 0.4)
            .attr("stroke-width", 1.5)
            .attr('transform', 'translate(10,' + (0.37 * svg_height) + ')');

        const gNode = svg_tree.append("g")
            .attr("cursor", "pointer")
            .attr('transform', 'translate(10,' + (0.37 * svg_height) + ')');

        update(root);

        function update(source) {
            const duration = d3.event && d3.event.altKey ? 2500 : 250;
            const nodes = root.descendants().reverse();
            const links = root.links();
            // Compute the new tree layout.
            tree(root);
            //通过判断节点的children来确定当前选中的类
            variable.cluster_arr = [];
            for (let i = 0; i < nodes.length; i++) {
                if (nodes[i].children == null)
                    variable.cluster_arr.push(nodes[i].data.name);
            }

            console.log('variable.cluster_arr: ', variable.cluster_arr);
            let left = root;
            let right = root;
            root.eachBefore(node => {
                if (node.x < left.x) left = node;
                if (node.x > right.x) right = node;
            });
            const height = right.x - left.x + margin.top + margin.bottom;
            const transition = svg_tree.transition()
                .duration(duration)
                .attr("height", height)
            // Update the nodes…
            gNode.selectAll("g").selectAll('circle')
                .attr("fill", d => {
                    return d.children ? "#999" : "#329CCB"
                })
            const node = gNode.selectAll("g")
                .data(nodes, d => d.id);

            // Enter any new nodes at the parent's previous position.
            const nodeEnter = node.enter().append("g")
                .attr("transform", d => `translate(${source.y0},${source.x0})`)
                .attr("fill-opacity", 0)
                .attr("stroke-opacity", 0)
                .on("click", d => {
                    tree_view.modifyCount += 1;
                    d.children = d.children ? null : d._children;
                    update(d);
                    //如果该节点的children为null则代表该节点的操作为合并
                    riverView.modifyRiver(variable.comb_data, variable.cluster_arr, d.children, d.data.name)
                });

            nodeEnter.append("circle")
                .attr("r", 5)
                .attr("fill", d => d.children ? "#999" : "#329CCB")

            // Transition nodes to their new position.
            const nodeUpdate = node.merge(nodeEnter).transition(transition)
                .attr("transform", d => `translate(${d.x},${d.y})`)
                .attr("fill-opacity", 1)
                .attr("stroke-opacity", 1);

            // Transition exiting nodes to the parent's new position.
            const nodeExit = node.exit().transition(transition).remove()
                .attr("transform", d => `translate(${source.x},${source.y})`)
                .attr("fill-opacity", 0)
                .attr("stroke-opacity", 0);

            // Update the links…
            const link = gLink.selectAll("path")
                .data(links, d => d.target.id);

            // Enter any new links at the parent's previous position.
            const linkEnter = link.enter().append("path")
                .attr("d", d => {
                    const o = { x: source.x0, y: source.y0 };
                    return diagonal({ source: o, target: o });
                });

            // Transition links to their new position.
            link.merge(linkEnter).transition(transition)
                .attr("d", diagonal);

            // Transition exiting nodes to the parent's new position.
            link.exit().transition(transition).remove()
                .attr("d", d => {
                    const o = { x: source.x, y: source.y };
                    return diagonal({ source: o, target: o });
                });

            // Stash the old positions for transition.
            root.eachBefore(d => {
                d.x0 = d.x;
                d.y0 = d.y;
            });
        }
    }



    return {
        draw_tree,
        modifyCount
    }
})()