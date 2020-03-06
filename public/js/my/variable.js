let variable = (function () {

    let comb_data; //当前游走类型的数据
    let link_data; //引用连线数据
    let node_data; //力引导点的数据
    let all_comb; //所有游走类型的数据集合
    let all_data; //所有参数的集合
    let type_count = 1; //选择了几个属性
    let attr = '1';
    let color_arr = ['#FF57D9', '#EB590C', '#FFD105', '#42F005', '#23FFE8']
    let attrValue_dict = {}
    let valueIds_dict = {}; //每个属性值对应点数组的字典
    let oriAttrName_dict = {
        '1': 'Conference',
        '2': 'Year',
        '3': 'Paper type'
    }

    let nodeInfo; //点的属性值字典
    let svg_tree = d3.select('#svg_tree')
    let svg_scatter = d3.select('#svg_scatter');
    let svg_brush = d3.select('#svg_brush');
    let svg_sankey = d3.select('#svg_sankey');
    let svg_force = d3.select('#svg_force');
    let viewbox = {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    }
    let yearPhase_dict = {
        '1': '90-94',
        '2': '95-99',
        '3': '00-04',
        '4': '05-09',
        '5': '10-14'
    };

    let attr_arr = ['1', '2', '3'];
    let info_dict = {}; //节点的信息字典

    let ChoseCluster = false; //判断当前选择点的方式
    let cluster_arr = [];
    let cluster_dict = {}; //点的簇字典
    let last_cluster_dict = {};
    let cluster_ids_dict = {} //每个簇内的点的集合字典
    let clusterLink_weight_dict;
    let clu_tpg;

    let attr_color = ["#1F8A70", '#BEDB38', '#FFE11A', '#FD7400', '#EE89FF']; //["#50ab4c", '#A597FF', '#FFAB7C', '#EE89FF', '#00D8FF'];
    let sankey_count = 1;
    let sankeyNode_data = []; //保存桑基图的节点数据
    let sankeyNodes_dict; //用来判断节点的数据是否已经存在里面
    let sankeyLink_data = []; //保存桑基图的连线数据

    let treeData;
    let oriLinks;
    let oriLink_dict = {};
    let station_links_dict = {};
    let period_dict;
    let level = 9;
    let param = {
        wt: 10,
        sl: 20,
        rl: false,
        comb: '1'
    };
    let last_cluster; // 记录上次选择的cluster，用于还原对应元素的样式

    let loc_dict; //坐标字典
    return {
        all_comb,
        comb_data,
        link_data,
        node_data,
        type_count,
        svg_scatter,
        svg_force,
        svg_brush,
        svg_tree,
        viewbox,
        attr_arr,
        info_dict,
        ChoseCluster,
        cluster_dict,
        last_cluster_dict,
        svg_sankey,
        sankeyNode_data,
        sankeyLink_data,
        sankey_count,
        sankeyNodes_dict,
        all_data,
        treeData,
        cluster_ids_dict,
        oriLinks,
        clusterLink_weight_dict,
        oriLink_dict,
        clu_tpg,
        period_dict,
        level,
        param,
        last_cluster,
        station_links_dict,
        attr_color,
        loc_dict,
        cluster_arr,
        attrValue_dict,
        attr,
        nodeInfo,
        color_arr,
        valueIds_dict,
        oriAttrName_dict,
        yearPhase_dict
    }
})()