let option = (function () {

    let cs_dict = { 'O-P': 'P', 'O-R': 'R', 'O': 'O', 'O-P-R': 'PR' }
    let comb_len = 0;
    let optIndex = 0;//记录操作的index
    let comb_record = [];//记录操作的具体参数元素格式为[当前属性选择，当前游走方式选择]
    let tmp_param = ["cited", '次', 'cited_chart'];
    let wt = 'wt_5', sl = 'sl_5', rl = 'rl_False';
    //修改串窗口的大小
    
    //读取数据和初始化各窗口
    d3.json('data/merge_corpus/topo_param_loc_0_3_4.json', function (all_data) {
        console.log('all_data: ', all_data);
        //赋值总数据集合
        variable.all_data = all_data;
        variable.all_comb = all_data['wt_5']['sl_5']['rl_False'];
        //绘制降维散点图
        scatter.drawScatter(variable.all_comb['conf_year']['info']);
        variable.comb_data = variable.all_comb['conf_year']['info']
        d3.json('data/links.json', function (error, link_data) {
            if (error)
                console.log(error);
            d3.json('data/info.json', function (error, info_dict) {
                d3.json('data/nodes.json', function (error, node_data) {
                    if (error)
                        console.log(error);
                    //生成簇字典并赋值给varibale
                    let tmp_dict = {};
                    for (let i = 0; i < variable.all_comb['conf_year']['info'].length; i++) {
                        tmp_dict[variable.all_comb['conf_year']['info'][i].id] = parseInt(variable.all_comb['conf_year']['info'][i].cluster);
                    }
                    variable.node_data = node_data;
                    variable.info_dict = info_dict;
                    variable.link_data = link_data;
                    variable.cluster_dict = tmp_dict;
                    variable.cluster_record.push(tmp_dict);
                    //绘制静态力引导图
                    // ForceChart.drawStaticForce(node_data, link_data, variable.cluster_dict);

                    //保存当前簇数据
                    let max_cluster = -1000;
                    let tmp_index = variable.confirm_time;
                    for (let id in variable.cluster_record[tmp_index]) {
                        let tmp_cluster = variable.cluster_record[tmp_index][id];//该点的目标簇
                        if (tmp_cluster > max_cluster)
                            max_cluster = tmp_cluster;
                    }
                    for (let i = 0; i <= max_cluster; i++) {
                        let tmp_id = tmp_index + '_' + i;
                        variable.sankeyNode_data.push({ 'id': tmp_id });
                    }
                    $('#max_cluster').text(max_cluster);
                });
            })
        })
    })

    //力引导图的簇展示
    $('#cluster_layout').on('click', function () {
        ForceChart.Clustering(variable.comb_data['clu_ids'], variable.comb_data['cluster_link'], variable.cluster_dict);
    })
    //设置参数选择
    $('#confirm').on('click', function () {
        //操作次数加一
        variable.confirm_time += 1;
        //***********获取当前各参数的选择情况***********
        comb_len = 0; //记录当前选择的属性数量，用于后面key的格式定义
        variable.attr = 'conf';
        //循环判断每个checkbox的状态来获取当前的属性选择
        variable.attr_arr.forEach(Element => {
            let tmp_checked = $('#' + Element)[0].checked;
            if (tmp_checked) {
                comb_len += 1;
                if (comb_len > 1) {
                    variable.attr += '_' + $('#' + Element)[0].id;
                } else {
                    variable.attr = $('#' + Element)[0].id;
                }
            }
        })
        console.log('variable.attr: ', variable.attr);

        sl = $('#sl_5')[0].checked ? 'sl_5' : 'sl_10';
        rl = $('#ret_True')[0].checked ? 'rl_True' : 'rl_False';
        console.log(wt, sl, rl, variable.attr)
        /*****************************************************/

        //将操作数据记录并添加到dropdown，格式为选择的属性 + 游走的方式
        comb_record.push(variable.attr);
        let tmp_text = variable.attr;
        let tmp_option = $('<a></a>').text(tmp_text).attr("id", optIndex).attr('class', 'dropdown-item').on('click', function () {
            variable.comb_data = variable.all_data[wt][sl][rl][comb_record[this.id]];
            // scatter.drawScatter(variable.comb_data['info']);
            ForceChart.Clustering(variable.comb_data['clu_ids'], variable.comb_data['cluster_link'], variable.cluster_dict);
        });
        $("#options").append(tmp_option);
        optIndex += 1;

        //根据参数选择获取对应数据
        variable.comb_data = variable.all_data[wt][sl][rl][variable.attr];
        let tmpCombData = variable.comb_data['info'];
        //生成簇字典
        let tmp_dict = {};
        for (let i = 0; i < tmpCombData.length; i++) {
            tmp_dict[tmpCombData[i].id] = parseInt(tmpCombData[i].cluster);
        }
        //将当前操作的簇字典添加到cluster_record
        variable.cluster_dict = tmp_dict;;
        variable.cluster_record.push(tmp_dict);
        scatter.drawScatter(tmpCombData);
        axisChart.drawAxis(variable.comb_data);
        ForceChart.Clustering(variable.comb_data['clu_ids'], variable.comb_data['cluster_link'], variable.cluster_dict);
    })

    function getCombData(param) {
        return new Promise(function (resolve, reject) {
            $.ajax({
                type: "get",
                url: "/id/ChosenId",
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