let option = (function () {

    let cs_dict = { 'O-P': 'P', 'O-R': 'R', 'O': 'O', 'O-P-R': 'PR' }
    let comb_len = 0;
    let optIndex = 0;//记录操作的index
    let comb_record = [];//记录操作的具体参数元素格式为[当前属性选择，当前游走方式选择]
    let tmp_param = ["cited", '次', 'cited_chart'];
    let param = { wt: 'wt_5', sl: 'sl_10', rl: 'rl_False', comb: 'period_0' };
    variable.param = param;
    //修改串窗口的大小


    //初始化
    getCombData(param).then(function (data) {
        d3.csv('data/Chicago/undir_link_weight.csv', function (error, data_link) {
            d3.json('data/Chicago/period_value_dict.json', function (error, data_period) {
                variable.period_dict = data_period;
                console.log('data_link: ', data_link);
                for (let i = 0; i < data_link.length; i++) {
                    if (variable.oriLink_dict[data_link[i].source] != null) {
                        variable.oriLink_dict[data_link[i].source].push(data_link[i].target)
                        variable.station_links_dict[data_link[i].source].push(data_link[i].target)
                    }
                    else {
                        variable.oriLink_dict[data_link[i].source] = [data_link[i].target];
                        variable.station_links_dict[data_link[i].source] = [data_link[i].target]
                    }
                    if (variable.oriLink_dict[data_link[i].target] != null) {
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
                variable.level = max_level - 6;
                clusterFun.cluster(variable.comb_data, max_level - 6)
                console.log('variable.comb_data: ', variable.comb_data);
                //绘制降维散点图
                scatter.drawScatter(variable.comb_data['info']);
                console.log(variable.comb_data['info'].length)
                //绘制力引导图
                forceChart.Clustering(variable.cluster_ids_dict, variable.clusterLink_weight_dict, variable.cluster_dict);
                tree_view.draw_tree(data[0]);
            })

        })


    }).catch(function (error) {
        console.log('error: ', error);
    })
    //力引导图的簇展示
    $('#cluster_layout').on('click', function () {
        forceChart.Clustering(variable.comb_data['clu_ids'], variable.comb_data['cluster_link'], variable.cluster_dict);
    });


    //设置参数选择
    $('#confirm').on('click', function () {
        //操作次数加一
        variable.confirm_time += 1;
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
        wt = $('#wt_5')[0].checked ? 'wt_5' : 'wt_10';
        sl = $('#sl_5')[0].checked ? 'sl_10' : 'sl_15';
        rl = $('#ret_True')[0].checked ? 'rl_True' : 'rl_False';
        let param = { wt: wt, sl: sl, rl: rl, comb: variable.attr }
        variable.param = param;
        //修改参数后修改各界面的view
        getCombData(param).then(function (data) {
            console.log('data: ', data);
            variable.comb_data = data[0];
            //通过用户选定的层级来生成类字典
            let max_level = d3.max(Object.keys(variable.comb_data['level_dict']), d => parseInt(d))
            variable.level = max_level - 6;
            clusterFun.cluster(variable.comb_data, max_level - 6)
            scatter.drawScatter(data[0]['info']);
            tree_view.draw_tree(data[0]);
            forceChart.Clustering(variable.cluster_ids_dict, variable.clusterLink_weight_dict, variable.cluster_dict);
        })
        console.log(wt, sl, rl, variable.attr)
        /*****************************************************/

        //将操作数据记录并添加到dropdown，格式为选择的属性 + 游走的方式
        comb_record.push(param);
        let tmp_text = variable.attr;
        let tmp_option = $('<a></a>').text(tmp_text).attr("id", optIndex).attr('class', 'dropdown-item').on('click', function () {
            getCombData(comb_record[this.id]).then(function (data) {
                variable.comb_data = data[0];
                //通过用户选定的层级来生成类字典
                let max_level = d3.max(Object.keys(variable.comb_data['level_dict']), d => parseInt(d))
                clusterFun.cluster(variable.comb_data, max_level - 6)
                scatter.drawScatter(data[0]['info']);
                parallel.drawParallel(variable.clu_tpg);
                tree_view.draw_tree(data[0]);
                forceChart.Clustering(variable.cluster_ids_dict, variable.clusterLink_weight_dict, variable.cluster_dict);
            })
        });
        $("#options").append(tmp_option);
        optIndex += 1;
    })

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