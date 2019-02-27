let scatter = (function () {

    d3.json('data/loc.json', function (attrs_data) {
        variable.attrs_data = attrs_data;
        variable.comb_data = attrs_data['j-a-t'];
        drawScatter(attrs_data['j-a-t']);
    })

    function drawScatter(comb_data) {
        variable.svg_scatter.selectAll('*').remove();
        let svg_width = $("#svg_scatter")[0].scrollWidth;
        let svg_height = $("#svg_scatter")[0].scrollHeight;

        comb_data.forEach(Element => {
            Element['x'] = parseFloat(Element['x']);
            Element['y'] = parseFloat(Element['y']);
        })
        console.log('comb_data: ', comb_data);
        let min_x = d3.min(comb_data, function (d) { return d.x });
        let min_y = d3.min(comb_data, function (d) { return d.y });
        let max_x = d3.max(comb_data, function (d) { return d.x });
        let max_y = d3.max(comb_data, function (d) { return d.y });
        let xScale = d3.scaleLinear().domain([min_x, max_x]).range([0, svg_width - 5]);
        let yScale = d3.scaleLinear().domain([min_y, max_y]).range([svg_height - 5, 0]);

        let color = { 'VAST': 'red', 'InfoVis': '#76FF6E', 'SciVis': 'gray' };
        variable.svg_scatter.append('g').selectAll('circle').data(comb_data).enter()
            .append('circle')
            .attr('cx', function (d) {
                return xScale(parseFloat(d.x));
            }).attr('cy', function (d) {
                return yScale(parseFloat(d.y));
            }).attr('r', 2)
            .attr('fill', function (d, i) {
                return color[d['journal']]
            }).on('click', function (d) {
                console.log(d);
            })


        //设置刷子
        var brush = d3.brush()
            .on("end", brushed);
        function brushed() {
            let selection = d3.event.selection;
            let inner_paper = [];
            variable.comb_data.forEach(Element => {
                Element.x = parseFloat(Element.x);
                Element.y = parseFloat(Element.y);
                if (xScale(Element.x) > selection[0][0] && xScale(Element.x) < selection[1][0] && yScale(Element.y) > selection[0][1] && yScale(Element.y) < selection[1][1])
                    inner_paper.push(Element);
            })
            parameters.drawchart(inner_paper);
        }
        $("#brush").click(function () {
            variable.svg_scatter.append("a")
                .attr("class", "brush")
                .call(brush)
        })
        //设置选点按钮操作
        // $("#point").click(function () {
        //     variable.svg_scatter.selectAll("a").remove();
        // })

    }


    return {
        drawScatter
    }
})()