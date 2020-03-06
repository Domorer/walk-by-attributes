let option = (function () {

    let cs_dict = {
        'O-P': 'P',
        'O-R': 'R',
        'O': 'O',
        'O-P-R': 'PR'
    }
    let comb_len = 0;
    let optIndex = 0; //记录操作的index
    let comb_record = []; //记录操作的具体参数元素格式为[当前属性选择，当前游走方式选择]

    //*************修改图例颜色**************
    $('.tuli').css('background-color', (i) => variable.attr_color[i])
    $('.leaflet-control-attribution, .leaflet-control').remove();
    comb_record.push(clusterFun.deepCopy(variable.param));

    //*************初始化******************
    console.log("option -> variable.param", variable.param)

    getCombData(variable.param).then(function (data) {
        d3.csv('data/paper/weighted_link.csv', function (error, data_link) {
            d3.json('data/paper/nodeInfo.json', function (error, nodeInfo) {
                variable.nodeInfo = nodeInfo;
                /* 遍历节点信息字典数据：
                    1. 获取valueCount_dict 各属性值拥有的点的数量
                    2. attrValue_dict  ,,属性字典，各属性所拥有的属性值字典
                */
               let node_quantity = 0
                for (let id in nodeInfo) {
                    node_quantity += 1
                    for (let attr in nodeInfo[id]) {
                        /*如果该属性不存在，则1.添加该属性，并将当前属性值添加
                                            2.将该属性值对应的点数组初始为包含当前id的数组
                        */
                        if ((attr in variable.attrValue_dict) == false) {
                            variable.attrValue_dict[attr] = [nodeInfo[id][attr]]
                            variable.valueIds_dict[attr] = {}
                            variable.valueIds_dict[attr][nodeInfo[id][attr]] = [id]
                        }else{
                            /*如果该属性已有，则判断该属性值是否已经存在，若不存在，则添加
                                        将该属性值对应的点的数量初始为包含当前id的数组
                            */
                            if(variable.attrValue_dict[attr].indexOf(nodeInfo[id][attr]) == -1){
                                variable.attrValue_dict[attr].push(nodeInfo[id][attr])
                                variable.valueIds_dict[attr][nodeInfo[id][attr]] = [id]
                                console.log("option -> [nodeInfo[id][attr]]", [nodeInfo[id][attr]])

                            }else{
                                //如果该属性值已存在，则将属性值对应的点数组里添加当前id
                                variable.valueIds_dict[attr][nodeInfo[id][attr]].push(id)
                            }
                        }
                    }
                }
                console.log("option -> variable.valueIds_dict", variable.valueIds_dict)
                console.log("option -> variable.attrValue_dict", variable.attrValue_dict)

                console.log('data_link: ', data_link)
                //修改属性信息展示窗口的数据
                let attr_count = 0;
                for(let key in variable.attrValue_dict)
                    attr_count += 1
                $('#node_quantity').text(node_quantity)
                $('#edge_quantity').text(data_link.length)
                $('#attr_quantity').text(attr_count)
                //获取原始link的字典
                for (let i = 0; i < data_link.length; i++) {
                    if (variable.oriLink_dict[data_link[i].source] != null) {
                        variable.oriLink_dict[data_link[i].source].push(data_link[i].target)
                        variable.station_links_dict[data_link[i].source].push(data_link[i].target)
                    } else {
                        variable.oriLink_dict[data_link[i].source] = [data_link[i].target];
                        variable.station_links_dict[data_link[i].source] = [data_link[i].target]
                    }
                    if (variable.station_links_dict[data_link[i].target] != null) {
                        variable.station_links_dict[data_link[i].target].push(data_link[i].source)
                    } else {
                        variable.station_links_dict[data_link[i].target] = [data_link[i].source]
                    }
                }
                variable.oriLinks = data_link;
                variable.comb_data = data[0];
                console.log("option -> comb_data", variable.comb_data)

                //通过用户选定的层级来生成类字典
                let max_level = d3.max(Object.keys(variable.comb_data['level_dict']), d => parseInt(d))
                //当前选中的层级
                variable.level = 9;
                clusterFun.cluster(variable.comb_data, variable.level, null)
                console.log('variable.comb_data: ', variable.comb_data);
                //绘制降维散点图
                scatter.drawScatter(variable.comb_data['info']);
                //绘制力引导图
                forceChart.Clustering(variable.cluster_ids_dict, variable.clusterLink_weight_dict, variable.cluster_dict);
                //树图
                tree_view.draw_tree(data[0], variable.level);
                //平行坐标轴
               
                
                parallel.drawParallel();

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
        // forceChart.Clustering(variable.comb_data['clu_ids'], variable.comb_data['cluster_link'], variable.cluster_dict);
        forceChart.Clustering(variable.cluster_ids_dict, variable.clusterLink_weight_dict, variable.cluster_dict);

    });
    $('#origin').on('click', function () {
        let oriNodes = []
        for (let key in variable.nodeInfo) {
            let tmp_node = variable.nodeInfo[key];
            tmp_node['id'] = key
            oriNodes.push(tmp_node);
        }
        forceChart.drawOriForce(oriNodes, variable.oriLinks, variable.cluster_dict);

    });

    //*******************滑块******************
    var slider_times = $("#walk_times").slider({
        orientation: "horizontal",
        range: "min",
        max: 10,
        value: 5,
        slide: function (event, ui) {
            if (ui.value <= 5)
                variable.param.wt = 5;
            else
                variable.param.wt = 10;

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
                variable.param.sl = 10;
            else
                variable.param.sl = 20;
            $("#length_text").val(ui.value);
        }
    })

    //********************确认按钮的参数确定********************
    $('#confirm').on('click', function () {
        //***********获取当前各参数的选择情况***********
        comb_len = 0; //记录当前选择的属性数量，用于后面key的格式定义
        variable.type_count = 0;
        variable.attr = 'random';
        tree_view.modifyCount = 1
        //循环判断每个checkbox的状态来获取当前的属性选择,如果一个也没选择就代表随机游走
        variable.attr_arr.forEach(Element => {
            let tmp_checked = $('#' + Element)[0].checked;
            if (tmp_checked) {
                comb_len += 1;
                variable.type_count += 1;
                if (comb_len > 1) {
                    variable.attr += $('#' + Element)[0].id;
                } else {
                    variable.attr = $('#' + Element)[0].id;
                }
            }
        })
        console.log('variable.attr: ', variable.attr);
        variable.param['rl'] = false;
        variable.param['comb'] = variable.attr;
        //*************修改参数后修改各界面的view****************
        getCombData(variable.param).then(function (data) {
            modify_cluster(data[0], false);
        })
        /*****************************************************/

        //将操作数据记录并添加到dropdown，格式为选择的属性 + 游走的方式
        option.comb_record.push(clusterFun.deepCopy(variable.param));
        let tmp_text = variable.attr;
        let tmp_option = $('<a></a>').text(tmp_text).attr("id", option.optIndex).attr('class', 'dropdown-item').on('click', function () {
            getCombData(option.comb_record[this.id]).then(function (data) {
                variable.comb_data = data[0];
                //通过用户选定的层级来生成类字典
                let max_level = d3.max(Object.keys(variable.comb_data['level_dict']), d => parseInt(d))
                clusterFun.cluster(variable.comb_data, variable.level, null)
                scatter.drawScatter(data[0]['info']);
                tree_view.draw_tree(data[0], variable.level);
                forceChart.Clustering(variable.cluster_ids_dict, variable.clusterLink_weight_dict, variable.cluster_dict);
            })
        });
        $("#options").append(tmp_option);
        option.optIndex += 1;
    })

    //用户自定义的类数组确定按钮
    $('#confirm_cluster').on('click', () => {
        modify_cluster(variable.comb_data, true);
    })
    //桑基图刷新按钮
    $('#refresh').on('click', () => {
        console.log('yes')
        variable.svg_sankey.selectAll('.sankeyLink').attr('stroke', '#d9d9d9').attr('opacity', 1);
        variable.svg_sankey.selectAll('rect').attr('opacity', 1.0);
    })
    //力引导图控件
    let transition = d3.transition().duration(2000),
        moveStep = 30;
    $('#ButtonRight').on('click', () => {
        variable.viewbox.left -= moveStep
        // variable.viewbox.right += moveStep
        variable.svg_force.transition(transition)
            .attr('viewBox', `${variable.viewbox.left} ${variable.viewbox.top} ${variable.viewbox.right} ${variable.viewbox.bottom}`)
    })
    $('#ButtonLeft').on('click', () => {
        variable.viewbox.left += moveStep
        // variable.viewbox.right -= moveStep
        variable.svg_force.transition(transition)
            .attr('viewBox', `${variable.viewbox.left} ${variable.viewbox.top} ${variable.viewbox.right} ${variable.viewbox.bottom}`)
    })
    $('#ButtonUp').on('click', () => {
        variable.viewbox.top += moveStep
        // variable.viewbox.bottom -= moveStep
        variable.svg_force.transition(transition)
            .attr('viewBox', `${variable.viewbox.left} ${variable.viewbox.top} ${variable.viewbox.right} ${variable.viewbox.bottom}`)
    })
    $('#ButtonDown').on('click', () => {
        variable.viewbox.top -= moveStep
        // variable.viewbox.bottom += moveStep
        variable.svg_force.transition(transition)
            .attr('viewBox', `${variable.viewbox.left} ${variable.viewbox.top} ${variable.viewbox.right} ${variable.viewbox.bottom}`)
    })
    $('#zoomIn').on('click', () => {
        let zoom = d3.zoom().scaleExtent([0.1, 10])
        variable.viewbox.top -= moveStep
        variable.viewbox.bottom += moveStep
        variable.svg_force.transition(transition)
            .attr('viewBox', `${variable.viewbox.left} ${variable.viewbox.top} ${variable.viewbox.right} ${variable.viewbox.bottom}`)
    })
    $('#zoomOut').on('click', () => {
        variable.viewbox.top -= moveStep
        variable.viewbox.bottom += moveStep * 2
        variable.svg_force.transition(transition)
            .attr('viewBox', `${variable.viewbox.left} ${variable.viewbox.top} ${variable.viewbox.right} ${variable.viewbox.bottom}`)
    })

    $('#toHeatmap').on('click', function () {
        console.log('checked: ', $('#inputHeat')[0].checked);
        // if ($('#inputHeat')[0].checked == true){

        //     scatter.drawHeat(variable.comb_data);
        // }
        // else{
        //     console.log('false')
        //     // d3.select('#scatter_canvas').select('canvas').remove();
        // }
    });

    //每次类变化后页面进行的操作
    function modify_cluster(data, tree_confirm) {
        //地图视图清空
        // d3.select('#map').selectAll('path').remove();

        //桑基图的列数加一
        variable.sankey_count += 1;
        console.log('data: ', data);
        variable.comb_data = data;
        //通过用户选定的层级中的类   或者选中的断层的类   来生成类字典
        let max_level = d3.max(Object.keys(variable.comb_data['level_dict']), d => parseInt(d))
        variable.level = 9;

        //通过判断当前的类是用户选择的还是自定层级的， 来确定参数
        if (tree_confirm == false)
            clusterFun.cluster(variable.comb_data, variable.level, null)
        else
            clusterFun.cluster(variable.comb_data, variable.level, variable.cluster_arr)

        //更新散点图
        scatter.drawScatter(data['info']);
        forceChart.Clustering(variable.cluster_ids_dict, variable.clusterLink_weight_dict, variable.cluster_dict);
        //如果不是通过修改断层来修改类数组则需要重绘树图
        if (tree_confirm == false)
            tree_view.draw_tree(data, variable.level);

        //桑基图
        console.log(variable.param)
        if (variable.sankey_count >= 2) {
            for (let key in variable.cluster_ids_dict)
                variable.sankeyNode_data.push({
                    'id': 'option' + variable.sankey_count.toString() + '-' + key,
                    stations: clusterFun.deepCopy(variable.cluster_ids_dict[key])
                })
            //计算类变化连线的权重
            let link_weight_dict = {};

            for (let key in variable.last_cluster_dict) {
                let s_clu = variable.last_cluster_dict[key].cluster,
                    t_clu;
                if (variable.cluster_dict[key] != null) {
                    t_clu = variable.cluster_dict[key].cluster;
                    let tmp_key = s_clu + '-' + t_clu
                    if (link_weight_dict[tmp_key] != null) {
                        link_weight_dict[tmp_key]['value'] += 1
                        link_weight_dict[tmp_key]['stations'].push(key)
                    } else {
                        link_weight_dict[tmp_key] = {
                            value: 1,
                            stations: [key]
                        }
                    }

                }
            }
            //将变化曲线添加到桑基图数据
            for (let key in link_weight_dict) {
                let tmp_source = 'option' + (variable.sankey_count - 1).toString() + '-' + key.split('-')[0],
                    tmp_target = 'option' + variable.sankey_count.toString() + '-' + key.split('-')[1];
                variable.sankeyLink_data.push({
                    'id': tmp_source + '-' + tmp_target,
                    'source': tmp_source,
                    'target': tmp_target,
                    'value': link_weight_dict[key]['value'],
                    'stations': link_weight_dict[key]['stations']
                })
            }
            // sankeyChart.drawSankey(variable.sankeyNode_data, variable.sankeyLink_data);
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
        comb_record,
        optIndex
    }
})()