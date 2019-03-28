let clusterFun = (function () {
    function cluster(data, level, cluster_ids) {
        console.log('cluster_ids: ', cluster_ids);
        console.log('level: ', level);
        let children_dict = data['children_dict'], level_dict = data['level_dict'];
        let cluster_arr = cluster_ids ? cluster_ids : level_dict[level];
        console.log('cluster_arr: ', cluster_arr);
        let cluster_ids_dict = {}

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
        
        if (variable.sankey_count == 1)
            variable.last_cluster_dict = deepCopy(id_cluster_dict);
        else {
            variable.last_cluster_dict = {}
            variable.last_cluster_dict = deepCopy(variable.cluster_dict);
        }
        variable.cluster_dict = id_cluster_dict;
        variable.cluster_ids_dict = cluster_ids_dict;

        //*************计算各个簇之间的连线权重字典*************
        let clusterLink_dict = {};
        for (let i = 0; i < variable.oriLinks.length; i++) {
            let tmp_link = variable.oriLinks[i];
            if (id_cluster_dict[tmp_link['source']] != null && id_cluster_dict[tmp_link['target']] != null) {
                let s_cluster = id_cluster_dict[tmp_link['source']].cluster,
                    t_cluster = id_cluster_dict[tmp_link['target']].cluster;
                let tmp_link_key = s_cluster + '-' + t_cluster;
                if (clusterLink_dict[tmp_link_key] != null)
                    clusterLink_dict[tmp_link_key] += 1
                else
                    clusterLink_dict[tmp_link_key] = 1;
            }
        }

        variable.clusterLink_weight_dict = clusterLink_dict;  //每条轨迹作为键，边的权重作为value
        // console.log('clusterLink_dict: ', clusterLink_dict);
        //计算每个簇内的所有连线的字典
        let clu_tpg = {};
        console.time('XX')
        //使用字典对比法
        for (let key in cluster_ids_dict) {
            clu_tpg[key] = [];
            for (let i = 0; i < cluster_ids_dict[key].length; i++) {
                if (variable.oriLink_dict[cluster_ids_dict[key][i]] != null) {
                    let tmp_targets = variable.oriLink_dict[cluster_ids_dict[key][i]];
                    for (let j = 0; j < tmp_targets.length; j++) {
                        if (cluster_ids_dict[key].indexOf(tmp_targets[j]) != -1) {
                            let tmp_value = variable.period_dict[cluster_ids_dict[key][i] + '_' + tmp_targets[j]]
                            clu_tpg[key].push({ 'source': cluster_ids_dict[key][i], 'target': tmp_targets[j], value: tmp_value })
                        }
                    }
                }
            }
        }
        // 究极暴力循环对比法
        // for (let key in cluster_ids_dict) {
        //     clu_tpg[key] = [];
        //     for (let i = 0; i < variable.oriLinks.length; i++) {
        //         if (cluster_ids_dict[key].indexOf(variable.oriLinks[i].source) != -1 &&
        //             cluster_ids_dict[key].indexOf(variable.oriLinks[i].target) != -1){
        //                 clu_tpg[key].push(variable.oriLinks[i])
        //             }
        //     }
        // }
        variable.clu_tpg = clu_tpg;
        // console.log('clu_tpg: ', clu_tpg);
        // console.log('cluster_ids_dict: ', cluster_ids_dict);
        console.timeEnd('XX');
    }


    //深拷贝函数
    function deepCopy(o) {
        if (o instanceof Array) {
            var n = [];
            for (var i = 0; i < o.length; ++i) {
                n[i] = deepCopy(o[i]);
            }
            return n;
        } else if (o instanceof Function) {
            var n = new Function("return " + o.toString())();
            return n
        } else if (o instanceof Object) {
            var n = {}
            for (var i in o) {
                n[i] = deepCopy(o[i]);
            }
            return n;
        } else {
            return o;
        }
    }
    return {
        cluster,
        deepCopy
    }
})()