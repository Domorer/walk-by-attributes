let parameters = (function () {

    let chartWidth = $('#paramDiv')[0].scrollWidth;
    let chartHeight = $('#paramDiv')[0].scrollHeight * 0.75;
    $('#conf_chart').width(chartWidth).height(chartHeight);
    $('#aff_chart').width(chartWidth).height(chartHeight);
    $('#time_chart').width(chartWidth).height(chartHeight)
    $('#abt_chart').width(chartWidth).height(chartHeight);
    function wordCloud(inner_paper, attr, unit, dom) {
        d3.select("#" + dom).selectAll("*").remove();
        let count_dict = {};
        for (let i = 0; i < inner_paper.length; i++) {
            let tmp_segList = inner_paper[i][attr];
            for (let j = 0; j < tmp_segList.length; j++) {
                if (count_dict[tmp_segList[j]])
                    count_dict[tmp_segList[j]] += 1
                else
                    count_dict[tmp_segList[j]] = 1;
            }
        };
        let words = [];
        for (key in count_dict) {
            let tmp_obj = {}
            tmp_obj['text'] = key;
            tmp_obj['size'] = 10 * Math.sqrt(count_dict[key]);
            words.push(tmp_obj)
        }
        // let words = [
        //     "words", "words", "words", "words", "words", "words", "words", "words",
        //     "words", "words"].map(function (d) {
        //         return { text: d, size: 10, test: "haha" };
        //     })
        var layout = d3.layout.cloud()
            .size([chartWidth, chartHeight])
            .words(words)
            .padding(5)
            .rotate(function () { return ~~(Math.random() * 2) * 90; })
            .font("Impact")
            .fontSize(function (d) { return d.size; })
            .on("end", draw);

        layout.start();

        function draw(words) {
            let color = d3.scaleOrdinal(d3.schemeCategory20);

            d3.select("#" + dom).append("svg")
                .attr("width", layout.size()[0])
                .attr("height", layout.size()[1])
                .append("g")
                .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
                .selectAll("text")
                .data(words)
                .enter().append("text")
                .style("font-size", function (d) { return d.size + "px"; })
                .style("font-family", "Impact")
                .attr("text-anchor", "middle")
                .attr('fill', function (d, i) {
                    return color(i);
                })
                .attr("transform", function (d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .text(function (d) { return d.text; });
        }
    }

    function valueCount(value_data, extent) {
        let s = extent[0];
        let value_dict = {};
        while (s <= extent[1]) {
            value_dict[s] = 0;
            s += 1;
        }
        value_data.forEach(Element => {
            value_dict[Element] += 1;
        })
        let count_arr = [];
        for (key in value_dict) {
            count_arr.push(value_dict[key]);
        }
        return count_arr;
    }

    //格式化数据
    function dataFormatter(obj, extent, unit) {
        let max = 0;
        let sum = 0;
        let temp = obj['value'];
        for (var i = 0, l = temp.length; i < l; i++) {
            max = Math.max(max, temp[i]);
            sum += temp[i];
            obj['value'][i] = {
                name: (extent[0] + i) + unit,
                value: temp[i]
            }
        }
        obj['max'] = Math.floor(max / 100) * 100;
        obj['sum'] = sum;

        return obj;
    }

    function drawCount(data, attr, unit, dom) {
        let year_data = [];
        for (let i = 0; i < data.length; i++) {
            year_data.push(parseInt(data[i][attr]));
        }
        let extent = d3.extent(year_data);
        let s_y = extent[0];
        let label_year_arr = [];//用于x轴的标签展示
        let index = 0;
        while (s_y <= extent[1]) {
            if (index % 2 == 1)
                label_year_arr.push('\n' + s_y)
            else
                label_year_arr.push(s_y)
            index += 1;
            s_y += 1;
        }

        year_data = valueCount(year_data, extent);
        let obj_year = { 'value': year_data }
        obj_year = dataFormatter(obj_year, extent, unit);
        let option_time = {
            title: {
                subtext: '选择集数据属性查看'
            },
            tooltip: {},
            grid: {
                top: 40,
                bottom: 30
            },
            xAxis: [
                {
                    'type': 'category',
                    'axisLabel': { 'interval': 0 },
                    'data': label_year_arr,
                    splitLine: { show: false },
                    name: unit
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    name: '',
                    // max: 53500
                }
            ],
            series: [
                {
                    name: 'VAST',
                    type: 'bar',
                    data: obj_year['value']
                }

            ]

        };
        let dom_time = document.getElementById(dom);
        let timeChart = echarts.init(dom_time);
        timeChart.setOption(option_time, true);
    }
    function drawConf(inner_paper, a, b, c) {
        let journal_dict = { 'VAST': 0, 'InfoVis': 0, 'SciVis': 0 };

        for (let i = 0; i < inner_paper.length; i++) {
            journal_dict[inner_paper[i].conf] += 1;
        }
        let option_conf = {
            title: {
                text: '论文会议占比',
                x: 'left'
            },
            legend: {
                orient: 'vertical',
                x: 'right',
                data: ['VAST', 'InfoVis', 'SciVis']
            },
            series: [
                {
                    name: '会议论文数量占比',
                    type: 'pie',
                    radius: ['40%', '55%'],
                    label: {
                        normal: {
                            formatter: '{a|{a}}{abg|}\n{hr|}\n  {b|{b}：}{c}  {per|{d}%}  ',
                            backgroundColor: '#eee',
                            borderColor: '#aaa',
                            borderWidth: 1,
                            borderRadius: 4,
                            rich: {
                                a: {
                                    color: '#999',
                                    lineHeight: 22,
                                    align: 'center'
                                },
                                hr: {
                                    borderColor: '#aaa',
                                    width: '100%',
                                    borderWidth: 0.5,
                                    height: 0
                                },
                                b: {
                                    fontSize: 16,
                                    lineHeight: 33
                                },
                                per: {
                                    color: '#eee',
                                    backgroundColor: '#334455',
                                    padding: [2, 4],
                                    borderRadius: 2
                                }
                            }
                        },
                        emphasis: {
                            show: true,
                            textStyle: {
                                fontSize: '30',
                                fontWeight: 'bold'
                            }
                        }
                    },
                    data: [
                        { value: journal_dict['VAST'], name: 'VAST' },
                        { value: journal_dict['InfoVis'], name: 'InfoVis' },
                        { value: journal_dict['SciVis'], name: 'SciVis' }
                    ]
                }
            ]
        };
        let dom_conf = document.getElementById("conf_chart");
        let confChart = echarts.init(dom_conf);
        confChart.setOption(option_conf, true);

    }
    function drawchart(inner_paper) {

        // drawCount(inner_paper, "cited", '次', 'cited_chart');
        let tmp_param = option.tmp_param;
        option.tmp_fun(inner_paper, tmp_param[0], tmp_param[1], tmp_param[2])
        $('#cited_chart-tab').on('click', function () {
            drawCount(inner_paper, "cited", '次', 'cited_chart');
            option.tmp_param = ["cited", '次', 'cited_chart'];
            option.tmp_fun = drawCount;
        })
        $('#aff_chart-tab').on('click', function () {
            wordCloud(inner_paper, 'aff', 'null', 'aff_chart');
            option.tmp_param = ['aff', 'null', 'aff_chart']
            option.tmp_fun = wordCloud;

        })
        $('#abt_chart-tab').on('click', function () {
            wordCloud(inner_paper, 'abt', 'null', 'abt_chart');
            option.tmp_param = ['abt', 'null', 'abt_chart']
            option.tmp_fun = wordCloud;

        })
        $('#time_chart-tab').on('click', function () {
            drawCount(inner_paper, "year", '年', 'time_chart');
            option.tmp_param = ["year", '年', 'time_chart']
            option.tmp_fun = drawCount;

        })
        $('#conf_chart-tab').on('click', function () {
            drawConf(inner_paper, 'null', 'null', 'null');
            option.tmp_fun = drawConf;
            option.tmp_param = ["null", 'null', 'null']
        })


    }

    return {
        drawchart,
        drawCount,
        wordCloud,
        drawConf
    }
})()