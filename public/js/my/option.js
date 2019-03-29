let option = (function () {

    let cs_dict = { 'O-P': 'P', 'O-R': 'R', 'O': 'O', 'O-P-R': 'PR' }
    let comb_len = 0;
    let optIndex = 0;//记录操作的index
    let comb_record = [];//记录操作的具体参数元素格式为[当前属性选择，当前游走方式选择]
    let tmp_param = ["cited", '次', 'cited_chart'];

    //*************修改图例颜色**************
    $('.tuli').css('background-color', (i) => variable.attr_color[i])
    $('.leaflet-control-attribution, .leaflet-control').remove();
    //*************初始化******************
    getCombData(variable.param).then(function (data) {
        d3.csv('data/Chicago/undir_link_weight.csv', function (error, data_link) {
            d3.json('data/Chicago/period_value_dict.json', function (error, data_period) {
                variable.period_dict = data_period;
                // console.log('data_link: ', data_link);
                //获取原始link的字典
                for (let i = 0; i < data_link.length; i++) {
                    if (variable.oriLink_dict[data_link[i].source] != null) {
                        variable.oriLink_dict[data_link[i].source].push(data_link[i].target)
                        variable.station_links_dict[data_link[i].source].push(data_link[i].target)
                    }
                    else {
                        variable.oriLink_dict[data_link[i].source] = [data_link[i].target];
                        variable.station_links_dict[data_link[i].source] = [data_link[i].target]
                    }
                    if (variable.station_links_dict[data_link[i].target] != null) {
                        variable.station_links_dict[data_link[i].target].push(data_link[i].source)
                    }
                    else {
                        variable.station_links_dict[data_link[i].target] = [data_link[i].source]
                    }
                }
                variable.oriLinks = data_link;
                variable.comb_data = data[0];

                //通过用户选定的层级来生成类字典
                let max_level = d3.max(Object.keys(variable.comb_data['level_dict']), d => parseInt(d))
                variable.level = 1;
                clusterFun.cluster(variable.comb_data, 1, null)
                console.log('variable.comb_data: ', variable.comb_data);
                //绘制降维散点图
                scatter.drawScatter(variable.comb_data['info']);
                console.log(variable.comb_data['info'].length)
                //绘制力引导图
                // forceChart.Clustering(variable.cluster_ids_dict, variable.clusterLink_weight_dict, variable.cluster_dict);
                //树图
                tree_view.draw_tree(data[0], variable.level);
                radarChart.draw('1131');

                //初始化桑基图
                for (let key in variable.cluster_ids_dict) {
                    variable.sankeyNode_data.push({ 'id': 'option' + variable.sankey_count.toString() + '-' + key })
                }
            })

        })
    }).catch(function (error) {
        console.log('error: ', error);
    })

    //获取站点坐标数据
    d3.json('data/Chicago/loc.json', function (error, data) {
        for (let key in data) {
            data[key]['lat'] = parseFloat(data[key]['lat'])
            data[key]['lng'] = parseFloat(data[key]['lng'])
        }
        variable.loc_dict = data;
    })
    //*****************力引导图的簇展示***************
    $('#cluster_layout').on('click', function () {
        forceChart.Clustering(variable.comb_data['clu_ids'], variable.comb_data['cluster_link'], variable.cluster_dict);
    });

    //*******************滑块******************
    var slider_times = $("#walk_times").slider({
        orientation: "horizontal",
        range: "min",
        max: 10,
        value: 5,
        slide: function (event, ui) {
            if (ui.value <= 5)
                variable.param.wt = 'wt_5';
            else
                variable.param.wt = 'wt_10';

            $("#times_text").val(ui.value);
        }
    })
    var slider_length = $("#walk_length").slider({
        orientation: "horizontal",
        range: "min",
        max: 10,
        value: 5,
        slide: function (event, ui) {
            if (ui.value <= 5)
                variable.param.sl = 'sl_10';
            else
                variable.param.sl = 'sl_15';
            $("#length_text").val(ui.value);
        }
    })

    //********************确认按钮的参数确定********************
    $('#confirm').on('click', function () {
        //***********获取当前各参数的选择情况***********
        comb_len = 0; //记录当前选择的属性数量，用于后面key的格式定义
        variable.attr = 'random';
        //循环判断每个checkbox的状态来获取当前的属性选择
        variable.attr_arr.forEach(Element => {
            let tmp_checked = $('#' + Element)[0].checked;
            if (tmp_checked) {
                comb_len += 1;
                if (comb_len > 1) {
                    variable.attr += '_' + $('#' + Element)[0].id;
                } else {
                    variable.attr = 'period_' + $('#' + Element)[0].id;
                }
            }
        })
        console.log('variable.attr: ', variable.attr);
        let rl = $('#ret_True')[0].checked ? 'rl_True' : 'rl_False';
        variable.param['rl'] = rl;
        variable.param['comb'] = variable.attr;
        //修改参数后修改各界面的view
        getCombData(variable.param).then(function (data) {
            modify_cluster(data[0], false);
        })
        /*****************************************************/

        //将操作数据记录并添加到dropdown，格式为选择的属性 + 游走的方式
        comb_record.push(variable.param);
        let tmp_text = variable.attr;
        let tmp_option = $('<a></a>').text(tmp_text).attr("id", optIndex).attr('class', 'dropdown-item').on('click', function () {
            getCombData(comb_record[this.id]).then(function (data) {
                variable.comb_data = data[0];
                //通过用户选定的层级来生成类字典
                let max_level = d3.max(Object.keys(variable.comb_data['level_dict']), d => parseInt(d))
                clusterFun.cluster(variable.comb_data, max_level - 6, null)
                scatter.drawScatter(data[0]['info']);
                tree_view.draw_tree(data[0], variable.level);
                forceChart.Clustering(variable.cluster_ids_dict, variable.clusterLink_weight_dict, variable.cluster_dict);
            })
        });
        $("#options").append(tmp_option);
        optIndex += 1;
    })

    //用户自定义的类数组确定按钮
    $('#confirm_cluster').on('click', () => {
        modify_cluster(variable.comb_data, variable.cluster_arr);
    })


    //每次类变化后页面进行的操作
    function modify_cluster(data, tree_confirm) {
        //桑基图的列数加一
        variable.sankey_count += 1;
        console.log('data: ', data);
        variable.comb_data = data;
        //通过用户选定的层级中的类   或者选中的断层的类   来生成类字典
        let max_level = d3.max(Object.keys(variable.comb_data['level_dict']), d => parseInt(d))
        variable.level = max_level - 6;
        //通过判断当前的类是用户选择的还是自定层级的， 来确定参数
        if (!tree_confirm)
            clusterFun.cluster(variable.comb_data, max_level - 6, null)
        else
            clusterFun.cluster(variable.comb_data, max_level - 6, variable.cluster_arr)

        //更新力引导图
        scatter.drawScatter(data['info']);
        //如果不是通过修改断层来修改类数组则需要重绘树图
        if (!tree_confirm)
            tree_view.draw_tree(data, variable.level);
        forceChart.Clustering(variable.cluster_ids_dict, variable.clusterLink_weight_dict, variable.cluster_dict);

        //桑基图
        console.log(variable.param)
        if (variable.sankey_count >= 2) {
            for (let key in variable.cluster_ids_dict)
                variable.sankeyNode_data.push({ 'id': 'option' + variable.sankey_count.toString() + '-' + key })
            //计算类变化连线的权重
            let link_weight_dict = {};

            for (let key in variable.last_cluster_dict) {
                let s_clu = variable.last_cluster_dict[key].cluster, t_clu;
                if (variable.cluster_dict[key] != null) {
                    t_clu = variable.cluster_dict[key].cluster;
                    let tmp_key = s_clu + '-' + t_clu
                    if (link_weight_dict[tmp_key] != null)
                        link_weight_dict[tmp_key] += 1
                    else
                        link_weight_dict[tmp_key] = 1
                }
            }
            //将变化曲线添加到桑基图数据
            for (let key in link_weight_dict) {
                let tmp_source = 'option' + (variable.sankey_count - 1).toString() + '-' + key.split('-')[0],
                    tmp_target = 'option' + variable.sankey_count.toString() + '-' + key.split('-')[1];
                variable.sankeyLink_data.push({ 'id': tmp_source + '-' + tmp_target, 'source': tmp_source, 'target': tmp_target, 'value': link_weight_dict[key] })
            }
            sankeyChart.drawSankey(variable.sankeyNode_data, variable.sankeyLink_data);
        }

    }

    function getCombData(param) {
        return new Promise(function (resolve, reject) {
            $.ajax({
                type: "get",
                url: "/comb_data",
                async: false,
                data: {
                    'wt': param.wt,
                    'sl': param.sl,
                    'rl': param.rl,
                    'comb': param.comb,
                },
                success: function (data) {
                    resolve(data);
                },
                error: function () {

                }
            });
        });
    }

    return {
        tmp_param
    }
})()