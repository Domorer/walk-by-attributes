let option = (function () {

    let cs_dict = { 'O-P': 'P', 'O-R': 'R', 'O': 'O', 'O-P-R': 'PR' }
    let comb_len = 0;
    let optIndex = 0;//记录操作的index
    let comb_record = [];//记录操作的具体参数元素格式为[当前属性选择，当前游走方式选择]
    let tmp_fun = parameters.drawCount;
    let tmp_param = ["cited", '次', 'cited_chart'];

    //读取数据和初始化各窗口
    d3.json('data/cluster_all_comb.json', function (all_data) {
        console.log('all_data: ', all_data);
        //赋值总数据集合
        variable.all_comb = all_data;
        //绘制降维散点图
        scatter.drawScatter(all_data['conf']['O']);
        d3.json('data/links.json', function (error, link_data) {
            if (error)
                console.log(error);
            d3.json('data/info.json', function (error, info_dict) {
                d3.json('data/nodes.json', function (error, node_data) {
                    if (error)
                        console.log(error);
                    //生成簇字典并赋值给varibale
                    let tmp_dict = {};
                    for (let i = 0; i < all_data['conf']['O'].length; i++) {
                        tmp_dict[all_data['conf']['O'][i].id] = parseInt(all_data['conf']['O'][i].cluster);
                    }
                    variable.node_data = node_data;
                    variable.info_dict = info_dict;
                    variable.link_data = link_data;
                    variable.cluster_dict = tmp_dict;
                    variable.cluster_record.push(tmp_dict);
                    //绘制静态力引导图
                    ForceChart.drawStaticForce(node_data, link_data, variable.cluster_dict);
                });
            })
        })
    })

    //力引导图的簇展示
    $('#cluster_layout').on('click', function () {
        ForceChart.Clustering(variable.node_data, variable.link_data, variable.cluster_dict);
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
        //记录游走方式
        let tmp_comb = 'O';
        let p_checked = $('#P')[0].checked;
        let r_checked = $('#R')[0].checked;
        if (p_checked)
            tmp_comb += '-P';
        if (r_checked)
            tmp_comb += '-R';
        variable.pr = cs_dict[tmp_comb];
        console.log('variable.pr: ', variable.pr);
        /*****************************************************/

        //将操作数据记录并添加到dropdown，格式为选择的属性 + 游走的方式
        comb_record.push([variable.attr, variable.pr]);
        let tmp_text = variable.attr + '-' + variable.pr;
        let tmp_option = $('<a></a>').text(tmp_text).attr("id", optIndex).attr('class', 'dropdown-item').on('click', function () {
            let tmpCombData = variable.all_comb[comb_record[this.id][0]][comb_record[this.id][1]];
            scatter.drawScatter(tmpCombData);
        });
        $("#options").append(tmp_option);
        optIndex += 1;

        //根据参数选择获取对应数据
        console.log('variable.all_comb: ', variable.all_comb);
        let tmpCombData = variable.all_comb[variable.attr][variable.pr];
        //生成簇字典
        let tmp_dict = {};
        for (let i = 0; i < tmpCombData.length; i++) {
            tmp_dict[tmpCombData[i].id] = parseInt(tmpCombData[i].cluster);
        }
        //将当前操作的簇字典添加到cluster_record
        variable.cluster_dict = tmp_dict;;
        console.log('tmp_dict: ', tmp_dict);
        variable.cluster_record.push(tmp_dict);
        scatter.drawScatter(tmpCombData);

        //判断是否可以绘制sankey
        if (variable.confirm_time == 2) {
            let sankey_links = [], sankey_nodes = [];
            let nodes_dict = {};

            let link_value_dict = {}; //便于计算每条link的value
            console.log('cluster_record: ', variable.cluster_record);
            for (let id in variable.cluster_record[0]) {
                let source_cluster = variable.cluster_record[0][id];//该点的起始簇
                let target_cluster = variable.cluster_record[1][id];//该点的目标簇
                //判断簇的始末位置都不是噪音簇
                if (source_cluster != -1 && target_cluster != -1) {
                    if (!nodes_dict['0-' + source_cluster]) {
                        nodes_dict['0-' + source_cluster] = ''
                    }
                    if (!nodes_dict['1-' + target_cluster]) {
                        nodes_dict['1-' + target_cluster] = ''
                    }
                    let tmp_key = source_cluster + '_' + target_cluster;
                    if (link_value_dict[tmp_key])
                        link_value_dict[tmp_key] += 1;
                    else
                        link_value_dict[tmp_key] = 1;
                }
            }
            //将每种link组合转换成arr形式
            console.log('nodes_dict: ', nodes_dict);
            for (let key in link_value_dict) {
                let source = '0' + '-' + key.split('_')[0];
                let target = '1' + '-' + key.split('_')[1];
                let tmp_link = { 'source': source, 'target': target, 'value': link_value_dict[key] };
                sankey_links.push(tmp_link);
            }
            for (let key in nodes_dict)
                sankey_nodes.push({ 'id': key });
            //调用桑基图绘制函数
            sankeyChart.drawSankey(sankey_nodes, sankey_links);
        }
    })

    return {
        tmp_fun,
        tmp_param
    }
})()