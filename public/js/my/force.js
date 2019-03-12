let ForceChart = (function () {
    let forceWidth = $('#svg_force')[0].scrollWidth;
    let forceHeight = $('#svg_force')[0].scrollHeight;
    d3.csv('data/link.csv', function (error, link_data) {
        if (error)
            console.log(error);
        d3.json('data/info.json', function (error, info_dict) {
            if (error)
                console.log(error);
            variable.info_dict = info_dict;
            console.log('info_dict: ', info_dict);
            variable.link_data = link_data;
            // drawForce(link_data, info_dict);
        })


    })
    function drawForce(link_data, info_data) {
        function transformData(info_data) {
            let tmp_data = [];
            for (let key in info_data) {
                let tmp_dict = info_data[key];
                tmp_dict['id'] = key;
                tmp_data.push(tmp_dict);
            }
            return tmp_data;
        }
        //节点拖曳的相关函数
        let drag = simulation => {

            function dragstarted(d) {
                if (!d3.event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            }

            function dragged(d) {
                d.fx = d3.event.x;
                d.fy = d3.event.y;
            }

            function dragended(d) {
                if (!d3.event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }

            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        }

        let node_data = transformData(info_data);
        let simulation = d3.forceSimulation(node_data)
            .force("charge", d3.forceManyBody().strength(-5).distanceMax(100))
            .force("link", d3.forceLink(link_data).id(d => d.id))
            .force("center", d3.forceCenter(forceWidth / 2, forceHeight / 2));

        let color = d3.scaleOrdinal(d3.schemeCategory20);
        //绘制节点
        let node = variable.svg_force.append('g').selectAll('circle').data(node_data).enter()
            .append('circle')
            .attr('r', 2)
            .attr('stroke', function (d) {
                d.cluster = parseInt(d.cluster);
                if (d.cluster != -1)
                    return color(d.cluster)
                else
                    return 'black';
            }).attr('fill', function (d) {
                if (d.cluster != -1)
                    return color(d.cluster)
                else
                    return 'black';
            }).attr('id', function (d) {
                return d.id;
            }).call(drag(simulation));

        //绘制边
        let link = variable.svg_force.append('g').selectAll('line').data(link_data).enter()
            .append('line')
            .attr('stroke', function (d) {
                let s_cluster = d.source.cluster;
                let t_cluster = d.target.cluster;
                if (s_cluster === t_cluster)
                    return color(parseInt(s_cluster));
                else
                    return 'gray';
            }).attr('stroke-width', 1)

        //设置力的作用函数
        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
        });

    }
    return {
        drawForce
    }
}())