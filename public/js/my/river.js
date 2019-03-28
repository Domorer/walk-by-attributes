let riverView = (function () {
    let value_arr = [], river_g;
    function Cal(data, cluster_arr) {
        //当前选中的时间段数组
        let tmp_attrs = variable.param.comb.split('_');
        tmp_attrs.shift()
        let children_dict = data['children_dict'], level_dict = data['level_dict'] //每个层拥有的所有id集合的字典;
        console.log('cluster_arr: ', cluster_arr);
        //各个类间连线的流量总和、各个类的选中属性的 类内流量占比 之和, 统计数值数组
        let cluBtLink_wt_dict = {}, cluRatio_dict = {}, value_dict = { inner: 0, interval: 0, ratioSum: 0 };
        //遍历树，获取当前节点所连的所有末端节点的集合
        let dfs = function (root) {
            var arr = [], res = [];
            if (root != null) {
                arr.push(root);
            }
            while (arr.length != 0) {
                var temp = arr.pop();
                if (temp.left == null && temp.right == null)
                    res.push(temp.id);
                //这里先放右边再放左边是因为取出来的顺序相反
                if (temp.right != null) {
                    arr.push(children_dict[temp.right]);
                }
                if (temp.left != null) {
                    arr.push(children_dict[temp.left]);
                }
            }
            return res;
        }
        //计算每个类内所有站点的集合
        let cluster_ids_dict = {}
        for (let i = 0; i < cluster_arr.length; i++) {
            let tmp_topNode = cluster_arr[i];
            cluster_ids_dict[tmp_topNode] = dfs(children_dict[tmp_topNode]);
        }
        // console.log('cluster_ids_dict: ', cluster_ids_dict);
        //计算站点的所在类字典
        let id_cluster_dict = {}, index = 0;
        for (let key in cluster_ids_dict) {
            for (let i = 0; i < cluster_ids_dict[key].length; i++) {
                id_cluster_dict[cluster_ids_dict[key][i]] = { cluster: key, index: index }
            }
            index += 1;
        }

        //*************计算各个簇之间的连线权重字典*************
        for (let i = 0; i < variable.oriLinks.length; i++) {
            let tmp_link = variable.oriLinks[i];
            //判断当前连线是否存在于本次游走的数据集内
            if (id_cluster_dict[tmp_link['source']] != null && id_cluster_dict[tmp_link['target']] != null) {
                let s_cluster = id_cluster_dict[tmp_link['source']].cluster,
                    t_cluster = id_cluster_dict[tmp_link['target']].cluster;
                let tmp_cluLink_key = s_cluster + '-' + t_cluster;
                let tmp_StLink_key = tmp_link['source'] + '_' + tmp_link['target'];
                let tmp_value = variable.period_dict[tmp_StLink_key]
                if (cluBtLink_wt_dict[tmp_StLink_key] != null) {
                    for (let a = 0; a < tmp_attrs.length; a++)
                        cluBtLink_wt_dict[tmp_cluLink_key] += tmp_value[a];
                }
                else {
                    cluBtLink_wt_dict[tmp_cluLink_key] = 0;
                    for (let a = 0; a < tmp_attrs.length; a++)
                        cluBtLink_wt_dict[tmp_cluLink_key] += tmp_value[a];
                }
            }
        }
        //通过判断连线键值的始末cluster相同来区分类内和类间流量
        let tmp_key;
        for (let key in cluBtLink_wt_dict) {
            tmp_key = key.split('-')
            if (tmp_key[0] == tmp_key[1]) {
                value_dict['inner'] += cluBtLink_wt_dict[key];
            } else {
                value_dict['interval'] -= cluBtLink_wt_dict[key]
            }
        }
        console.log('cluster_ids_dict: ', cluster_ids_dict);
        for (let clu = 0; clu < cluster_arr.length; clu++) {
            let attrs_value = new Array(5).fill(0);
            let tmp_ids = cluster_ids_dict[cluster_arr[clu]]

            for (let i = 0; i < tmp_ids.length; i++) {
                let tmp_targets = variable.station_links_dict[tmp_ids[i]];
                let inner_value = new Array(5).fill(0), outer_value = new Array(5).fill(0);
                for (let j = 0; j < tmp_targets.length; j++) {
                    let tmp_link_key = Math.min(parseInt(tmp_ids[i]), parseInt(tmp_targets[j])) + '_' + Math.max(parseInt(tmp_ids[i]), parseInt(tmp_targets[j]));
                    if (tmp_ids.indexOf(tmp_targets[j]) != -1)
                        for (let a = 0; a < 5; a++)
                            inner_value[a] += variable.period_dict[tmp_link_key][a]
                    if (tmp_ids.indexOf(tmp_targets[j]) == -1)
                        for (let a = 0; a < 5; a++)
                            outer_value[a] += variable.period_dict[tmp_link_key][a]
                }
                let ratio_arr = new Array(5);
                for (let a = 0; a < tmp_attrs.length; a++) {
                    if (inner_value[a] == 0 && outer_value[a] == 0)
                        ratio_arr[a] = 0;
                    else
                        ratio_arr[a] = inner_value[a] / (inner_value[a] + outer_value[a])
                }

                for (let a = 0; a < ratio_arr.length; a++) {
                    attrs_value[a] += ratio_arr[a] / tmp_ids.length;
                }
            }
            for (let a = 0; a < tmp_attrs.length; a++) {
                value_dict['ratioSum'] += attrs_value[parseInt(tmp_attrs[a])]
            }
        }
        riverView.value_arr.push(value_dict)
    }
    function modifyRiver(data, cluster_arr) {
        console.log('cluster_arr: ', cluster_arr);

        Cal(data, cluster_arr)
        let svg_width = $("#svg_tree")[0].scrollWidth;
        let svg_height = $("#svg_tree")[0].scrollHeight;
        Cal(data, cluster_arr);
        let max_inner = d3.max(riverView.value_arr, d => d['inner']),
            min_interval = d3.min(riverView.value_arr, d => d['interval'])
        let tmp_scale = d3.scaleLinear()
            .domain([min_interval, max_inner])
            .range([0.3 * svg_height, 0.1 * svg_height])

        let areaInitial = d3.area()
            .x((d, i) => i * (svg_width / tree_view.modifyCount))
            .y1(d => tmp_scale(d.value))
            .y0(0.2 * svg_height)
        let area_arr = [[], []];
        for (let i = 0; i < riverView.value_arr.length; i++) {
            area_arr[0].push({ 'type': 'inner', value: riverView.value_arr[i]['inner'] })
            area_arr[1].push({ 'type': 'interval', value: riverView.value_arr[i]['interval'] })
        }
        console.log('area_arr: ', area_arr);

        let river_color = ['#a7ff4e', '#4e4eff', '#ffa74e']
        riverView.river_g
            .transition()
            .duration(2000)
            .attr('d', (d, i) => areaInitial(area_arr[i]))
            .attr('fill', (d,i)=>river_color[i])
            console.log('riverView.river_g: ', riverView.river_g);
    }

    function drawRiver(data, cluster_arr) {

        let svg_tree = d3.select('#svg_tree')
        let svg_width = $("#svg_tree")[0].scrollWidth;
        let svg_height = $("#svg_tree")[0].scrollHeight;
        Cal(data, cluster_arr);
        let max_inner = d3.max(riverView.value_arr, d => d['inner']),
            min_interval = d3.min(riverView.value_arr, d => d['interval'])

        let tmp_scale = d3.scaleLinear()
            .domain([min_interval, max_inner])
            .range([0.3 * svg_height, 0.1 * svg_height])

        let areaInitial = d3.area()
            .x((d, i) => {
                console.log(i * (svg_width / tree_view.modifyCount))
                return i * (svg_width / tree_view.modifyCount);
            })
            .y1(d => {
                console.log(tmp_scale(d.value))
                return tmp_scale(d.value);
            })
            .y0(0.2 * svg_height)
        let area_arr = [[], []];
        for (let i = 0; i < riverView.value_arr.length; i++) {
            area_arr[0].push({ 'type': 'inner', value: riverView.value_arr[i]['inner'] })
            area_arr[1].push({ 'type': 'interval', value: riverView.value_arr[i]['interval'] })

        }
        console.log('area_arr: ', area_arr);

        let river_color = ['#a7ff4e', '#4e4eff', '#ffa74e']
        
        riverView.river_g = svg_tree.append('g').selectAll('path').data(area_arr).enter()
            .append('path')
            .attr('d', areaInitial)
            .attr('fill', (d,i)=>river_color[i])
        //     svg_tree//.append('g').selectAll('path').data(area_arr).enter()
        //     .append('path')
        //     .attr('d', areaInitial(area_arr[1]))
        //     .attr('fill', '#a7ff4e')
        // console.log('riverView.river_g: ', riverView.river_g);
    }
    return {
        drawRiver,
        modifyRiver,
        value_arr,
        river_g
    }
})()