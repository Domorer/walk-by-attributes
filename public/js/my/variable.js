let variable = (function () {

    let comb_data;//当前游走类型的数据
    let link_data;//引用连线数据
    let node_data;//力引导点的数据
    let all_comb;//所有游走类型的数据集合
    let svg_scatter = d3.select('#svg_scatter');
    let svg_brush = d3.select('#svg_brush');
    let svg_sankey = d3.select('#svg_sankey');
    let svg_force = d3.select('#svg_force');
    let attr_arr = ['conf', 'aff', 'abt', 'year', 'cited'];
    let chose = ['P', 'R'];
    let attr = 'conf';//当前选中的属性组合
    let pr = 'O';//当前需那种的游走方式
    let info_dict = {};//节点的信息字典
    let ChoseCluster = false;//判断当前选择点的方式
    let cluster_dict = {};//点的簇字典
    let confirm_time = 0;//记录操作了几次，用于判断是否需要绘制桑基图
    let cluster_record = [];//保存每次操作的cu字典
    let sankeyNode_data = [];//保存桑基图的节点数据
    let nodes_dict;//用来判断节点的数据是否已经存在里面
    let sankeyLink_data = [];//保存桑基图的连线数据
    return {
        all_comb,
        comb_data,
        link_data,
        node_data,
        svg_scatter,
        svg_force,
        svg_brush,
        attr_arr,
        chose,
        attr,
        pr,
        info_dict,
        ChoseCluster,
        cluster_dict,
        svg_sankey,
        confirm_time,
        cluster_record,
        sankeyNode_data,
        sankeyLink_data,
        nodes_dict
    }
})()