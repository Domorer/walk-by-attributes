let variable = (function () {
            let dataset = 'weibo';
            let comb_data; //当前游走类型的数据
            let link_data; //引用连线数据
            let node_data; //力引导点的数据
            let all_comb; //所有游走类型的数据集合
            let all_data; //所有参数的集合
            let type_count = 1; //选择了几个属性
            let attr = '0';
            let w1 = 0.1,
                w2 = 6,
                w3 = 0.1;
            let attrValue_dict = {}
            let valueIds_dict = {}; //每个属性值对应点数组的字典
            let oriAttrName_dict = {
                'patent': {
                    '1': 'Year',
                    '2': 'Country',
                    '3': 'Class',
                    '4': 'Cat',
                    '5': 'Subcat'
                },
                'paper': {
                    '1': 'Conf',
                    '2': 'Year',
                    '3': 'Type'
                },
                'weibo': {
                    '1': 'city',
                    '2': 'sex',
                    '3': 'vip',
                    '4': 'prof'
                }
            }
            let attr_arr_dict = {
                'paper': ['1', '2', '3'],
                'patent': ['1', '2', '3', '4', '5']
            };
            let attr_color = ['#7fc97f', '#beaed4', '#fdc086', '#ffff99', '#386cb0']
            let valueColor_dict = {
                'paper': {
                    '1': ['#c2e699', '#78c679', '#31a354'],
                    '2': ['#bfd3e6', '#9ebcda', '#8c96c6', '#8c6bb1', '#88419d', '#6e016b'],
                    '3': ['#fed98e', '#fe9929', '#d95f0e'],
                    '4': ['#ffffd4', '#fee391', '#fec44f', '#fe9929', '#ec7014', '#cc4c02', '#8c2d04'],
                    '5': ['#f2f0f7', '#dadaeb', '#bcbddc', '#9e9ac8', '#807dba', '#6a51a3', '#4a1486']
                },
                'patent': {
                    '1': ['#f7fcfd', '#e5f5f9', '#ccece6', '#99d8c9', '#66c2a4', '#41ae76', '#238b45', '#006d2c', '#00441b'],
                    '2': ['#9ebcda', '#8c96c6'],
                    '3': ['#ffffe5', '#fff7bc', '#fee391', '#fec44f', '#fe9929', '#ec7014', '#cc4c02', '#993404', '#662506'],
                    '4': ['#ffffd4', '#fee391', '#fec44f', '#fe9929', '#ec7014', '#cc4c02', '#8c2d04'],
                    '5': ['#f2f0f7', '#dadaeb', '#bcbddc', '#9e9ac8', '#807dba', '#6a51a3', '#4a1486']
                },
                'weibo': {
                    '1': ['#f7fcfd', '#e5f5f9', '#ccece6', '#99d8c9', '#66c2a4', '#41ae76', '#238b45', '#006d2c', '#00441b'],
                    '2': ['#9ebcda', '#8c96c6'],
                    '3': ['#fee391', '#ec7014'],
                    '4': ['#ffffd4', '#fee391', '#fec44f', '#fe9929', '#ec7014', '#cc4c02', '#8c2d04'],
                    '5': ['#f2f0f7', '#dadaeb', '#bcbddc', '#9e9ac8', '#807dba', '#6a51a3', '#4a1486']
                }};

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
                    'paper': {
                        '1': '90-94',
                        '2': '95-99',
                        '3': '00-04',
                        '4': '05-09',
                        '5': '10-14'
                    },
                    'patent': {
                        '1': '63-67',
                        '2': '68-72',
                        '3': '73-77',
                        '4': '78-82',
                        '5': '83-87',
                        '6': '88-92',
                        '7': '93-97',
                        '8': '98-99'
                    }
                };


                let info_dict = {}; //节点的信息字典

                let ChoseCluster = false; //判断当前选择点的方式
                let cluster_arr = [];
                let cluster_dict = {}; //点的簇字典
                let last_cluster_dict = {};
                let cluster_ids_dict = {} //每个簇内的点的集合字典
                let clusterLink_weight_dict;
                let clu_tpg;

                ; //["#50ab4c", '#A597FF', '#FFAB7C', '#EE89FF', '#00D8FF'];
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
                    comb: '0'
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
                    attr_arr_dict,
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
                    valueIds_dict,
                    oriAttrName_dict,
                    yearPhase_dict,
                    w1,
                    w2,
                    w3,
                    valueColor_dict,
                    dataset
                }
            })()