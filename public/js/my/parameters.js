let parameters = (function () {

    function drawchart(inner_paper) {

        let journal_dict = { 'VAST': { 'value': [] }, 'InfoVis': { 'value': [] }, 'SciVis': { 'value': [] } };

        let year_arr = [];
        inner_paper.forEach(Element => {
            Element.year = parseInt(Element.year);
            year_arr.push(Element.year);

            journal_dict[Element.journal]['value'].push(Element.year);
        });

        let s_y = d3.extent(year_arr)[0];
        let label_year_arr = [];
        let index = 0;
        while (s_y <= d3.extent(year_arr)[1]) {
            if (index % 2 == 1)
                label_year_arr.push('\n' + s_y + '年')
            else
                label_year_arr.push(s_y + '年')

            index += 1;
            s_y += 1;
        }
        for (key in journal_dict) {
            journal_dict[key]['value'] = yearCount(journal_dict[key]['value'], d3.extent(year_arr));
        }
        for (key in journal_dict) {
            journal_dict[key] = dataFormatter(journal_dict[key], d3.extent(year_arr));
        }
        console.log('label_year_arr: ', label_year_arr);
        console.log('journal_dict: ', journal_dict);
        function yearCount(year_data, extent) {
            let s_y = extent[0];
            let year_dict = {};
            while (s_y <= extent[1]) {
                year_dict[s_y] = 0;
                s_y += 1;
            }
            year_data.forEach(Element => {
                year_dict[Element] += 1;
            })
            let count_arr = [];
            for (key in year_dict) {
                count_arr.push(year_dict[key]);
            }
            return count_arr;
        }
        function dataFormatter(obj, extent) {
            var temp;
            var max = 0;
            var sum = 0;
            temp = obj['value'];
            for (var i = 0, l = temp.length; i < l; i++) {
                max = Math.max(max, temp[i]);
                sum += temp[i];
                obj['value'][i] = {
                    name: (extent[0] + i) + "年",
                    value: temp[i]
                }
            }
            obj['max'] = Math.floor(max / 100) * 100;
            obj['sum'] = sum;

            return obj;
        }

        option = {
            title: {
                subtext: '选择集数据属性查看'
            },
            tooltip: {},
            legend: {
                right:200,
                data: ['VAST', 'InfoVis', 'SciVis'],
                selected: {
                    'VAST': true, 'InfoVis': true, 'SciVis': true
                }
            },
            grid: {
                top: 80,
                bottom: 100
            },
            xAxis: [
                {
                    'type': 'category',
                    'axisLabel': { 'interval': 0 },
                    'data': label_year_arr,
                    splitLine: { show: false }
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
                    data: journal_dict['VAST']['value']
                }
                ,
                {
                    name: 'InfoVis',
                    type: 'bar',
                    data: journal_dict['InfoVis']['value']
                },
                {
                    name: 'SciVis',
                    type: 'bar',
                    data: journal_dict['SciVis']['value']
                }
                ,
                {
                    name: '论文片数',
                    type: 'pie',
                    center: ['90%', '20%'],
                    radius: '28%',
                    data: [
                        { name: 'VAST', value: journal_dict['VAST']['sum'] },
                        { name: 'InfoVis', value: journal_dict['InfoVis']['sum'] },
                        { name: 'SciVis', value: journal_dict['SciVis']['sum'] }
                    ]
                }
            ]

        };
        let dom = document.getElementById("param");
        let myChart = echarts.init(dom);
        myChart.setOption(option, true);


    }

    return {
        drawchart
    }
})()