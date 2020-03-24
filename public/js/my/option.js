let option = (function () {

    let comb_len = 0;
    let optIndex = 0; //记录操作的index
    let comb_record = []; //记录操作的具体参数元素格式为[当前属性选择，当前游走方式选择]

    //*************修改图例颜色**************
    $('.tuli').css('background-color', (d, i) => variable.attr_color[i])

    $('.leaflet-control-attribution, .leaflet-control').remove();
    comb_record.push(clusterFun.deepCopy(variable.param));
    //*************初始化******************
    resetByDataset();
    console.log("option -> variable.param", variable.param)



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
        min: 10,
        max: 30,
        value: 10,
        slide: function (event, ui) {
            if (ui.value <= 10)
                variable.param.wt = 10;
            else
                variable.param.wt = 10;

            $("#times_text").val(ui.value);
        }
    })
    var slider_length = $("#walk_length").slider({
        orientation: "horizontal",
        range: "min",
        min: 15,
        max: 40,
        value: 20,
        slide: function (event, ui) {
            if (ui.value <= 5)
                variable.param.sl = 10;
            else
                variable.param.sl = 20;
            $("#length_text").val(ui.value);
        }
    })


    $('#confirm_param, #confirm_attr').on('click', function () {
        reset()
    })
    //treeView 按钮设置
    $('#datasetDropdown').on('click', function (e) {
        let tmp_text = e.target.innerText,
            tmp_dataset = e.target.getAttribute('value')
        $('#button_dataset').text(tmp_text)
        variable.dataset = tmp_dataset
        d3.select('#attributes').selectAll('.custom-checkbox').remove();
        for (let j = 0; j < variable.attr_arr_dict[variable.dataset].length; j++) {
            let checked = null
            if (j == 0)
                checked = 'checked'
            let tmp_attrName = variable.oriAttrName_dict[variable.dataset][j + 1]
            let tmpInnerHtml = `<div class='custom-control custom-checkbox' style='margin:3% 5% 0 5%;'>` +
                `<input type='checkbox' class='custom-control-input' id='${j + 1}' ${checked}>` +
                `<label class='custom-control-label' for='${j + 1}' id='citedLabe${j}' style='color:gray'>${tmp_attrName}</label>` +
                `<div class='tuli' style='background-color:${variable.attr_color[j]}'></div></div>`
            $('#attributes').append(tmpInnerHtml)
        }
        resetByDataset()

    })
    $('#w1').on('click', function (e) {
        let tmp_value = e.target.getAttribute('value')
        $('#button_w1').text('w1: ' + tmp_value)
        variable.w1 = tmp_value
    })

    $('#w2').on('click', function (e) {
        let tmp_value = e.target.getAttribute('value')
        $('#button_w2').text('w2: ' + tmp_value)
        variable.w2 = tmp_value
    })
    $('#w3').on('click', function (e) {
        let tmp_value = e.target.getAttribute('value')
        $('#button_w3').text('w3: ' + tmp_value)
        variable.w3 = tmp_value
    })
    $('#em').on('click', function (d) {
        console.log("generateRandomFaultage -> tree_view.tree_nodes_dict[tmp_cluster]", tree_view.tree_nodes_dict)

        tree_view.modifyCount += 1
        let faultages = [],
            visCluster_arr = []
        //获取当前树的所有可视节点id, 从level_dict 从后往前遍历
        let max_level = d3.max(Object.keys(variable.comb_data['level_dict']), d => parseInt(d))
        for (let i = max_level; i > variable.level; i--) {
            for (let j = 0; j < variable.comb_data['level_dict'][i].length; j++)
                visCluster_arr.push(variable.comb_data['level_dict'][i][j])
        }
        for (let i = 0; i < 100; i++) {
            let tmp_visCluster_arr = visCluster_arr.slice(0)
            faultages.push(tree_view.generateRandomFaultage(tmp_visCluster_arr))
        }
        console.log("option -> faultages", faultages)
        let emFaultage = [],
            minEnergy = Infinity
        for (let i = 0; i < faultages.length; i++) {
            let tmp_dict = riverView.Cal(variable.comb_data, faultages[i]),
                tmpEnergy = tmp_dict.ah + tmp_dict.sc + tmp_dict.ts
            if (minEnergy > tmpEnergy) {
                minEnergy = tmpEnergy
                emFaultage = faultages[i]
            }
        }
        /*层次树节点的颜色
            1.恢复之前已经选中的节点的颜色为默认颜色    
            2.修改最有切层节点的颜色为选中颜色
        */
        let colorSelected = '#ff4416',
            colorOri = '#329CCB'
        for (let j = 0; j < variable.cluster_arr.length; j++) {
            d3.select('#tree_' + variable.cluster_arr[j])
                .attr('fill', colorOri)
        }
        //更新当前的cluster_arr
        variable.cluster_arr = emFaultage
        for (let j = 0; j < variable.cluster_arr.length; j++) {
            d3.select('#tree_' + variable.cluster_arr[j])
                .transition()
                .duration(1000)
                .attr('fill', colorSelected)
        }
        let top_nodeId = variable.comb_data['level_dict'][max_level][0],
            topNode = tree_view.tree_nodes_dict[top_nodeId]
        let tmp_node = {
            'name': topNode.data.name,
            'x': topNode.x + 10,
            'y': topNode.y + tree_view.transformHeight
        };
        riverView.modifyRiver(variable.comb_data, emFaultage, false, tmp_node, false)
        console.log("option -> emFaultage", emFaultage)
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
        variable.viewbox.top += moveStep
        variable.viewbox.bottom -= moveStep * 2
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
        variable.level = max_level - 9;

        //通过判断当前的类是用户选择的还是自定层级的， 来确定参数
        if (tree_confirm == false)
            clusterFun.cluster(variable.comb_data, variable.level, null)
        else
            clusterFun.cluster(variable.comb_data, variable.level, variable.cluster_arr)
        //更新散点图
        scatter.drawScatter(data['info']);
        forceChart.Clustering(variable.cluster_ids_dict, variable.clusterLink_weight_dict, variable.cluster_dict);


        if (tree_confirm == false)
            tree_view.draw_tree(data, variable.level);
        parallel.drawParallel();
    }


    //********************确认按钮的参数确定********************
    function reset() {
        //***********获取当前各参数的选择情况***********
        comb_len = 0; //记录当前选择的属性数量，用于后面key的格式定义
        variable.type_count = 0;
        variable.attr = '';
        tree_view.modifyCount = 1
        //循环判断每个checkbox的状态来获取当前的属性选择,如果一个也没选择就代表随机游走
        variable.attr_arr_dict[variable.dataset].forEach(Element => {
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
        getCombData(variable.param, variable.dataset).then(function (data) {
            modify_cluster(data[0], false);
        })
        /*****************************************************/

        //将操作数据记录并添加到dropdown，格式为选择的属性 + 游走的方式
        option.comb_record.push(clusterFun.deepCopy(variable.param));

    }

    function resetByDataset() {
        if (variable.dataset == 'paper') {
            variable.param = {
                wt: 10,
                sl: 20,
                rl: false,
                comb: '1'
            };
            variable.attr = '1'
            variable.type_count = 1
        } else {
            variable.type_count = 1
            variable.param = {
                wt: 10,
                sl: 20,
                rl: false,
                comb: '1'
            };
            variable.attr = '1'
        }
        getCombData(variable.param, variable.dataset).then(function (data) {
            d3.csv(`data/${variable.dataset}/weighted_link.csv`, function (error, data_link) {
                d3.json(`data/${variable.dataset}/nodeInfo.json`, function (error, nodeInfo) {
                    variable.nodeInfo = nodeInfo;
                    /* 遍历节点信息字典数据：
                        1. 获取valueCount_dict 各属性值拥有的点的数量
                        2. attrValue_dict  ,,属性字典，各属性所拥有的属性值字典
                    */
                    let node_quantity = 0
                    variable.attrValue_dict = {}
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
                            } else {
                                /*如果该属性已有，则判断该属性值是否已经存在，若不存在，则添加
                                            将该属性值对应的点的数量初始为包含当前id的数组
                                */
                                if (variable.attrValue_dict[attr].indexOf(nodeInfo[id][attr]) == -1) {
                                    variable.attrValue_dict[attr].push(nodeInfo[id][attr])
                                    variable.valueIds_dict[attr][nodeInfo[id][attr]] = [id]
                                } else {
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
                    for (let key in variable.attrValue_dict)
                        attr_count += 1
                    
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


                    //当前选中的层级
                    let max_level = d3.max(Object.keys(variable.comb_data['level_dict']), d => parseInt(d))
                    variable.level = max_level - 9;
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


                    //修改force框内的数据，每次confirm都要重新更新数据，不管是哪里的confirm按钮
                    $('#node_quantity').text(node_quantity)
                    $('#edge_quantity').text(data_link.length)
                    $('#cluster_quantity').text(variable.cluster_arr.length)
                })

            })
        }).catch(function (error) {
            console.log('error: ', error);
        })
    }

    function getCombData(param, dataset) {
        return new Promise(function (resolve, reject) {
            $.ajax({
                type: "get",
                url: "/" + dataset,
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