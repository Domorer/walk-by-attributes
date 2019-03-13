let variable = (function () {

    let comb_data;
    let link_data;
    let all_comb;
    let svg_scatter = d3.select('#svg_scatter');
    let svg_brush = d3.select('#svg_brush');
    let svg_sankey = d3.select('#svg_sankey');
    let svg_force = d3.select('#svg_force');
    let attr_arr = ['conf', 'aff', 'abt', 'year', 'cited'];
    let chose = ['P', 'R'];
    let attr = 'conf';
    let pr = 'O';
    let info_dict = {};
    let ChoseCluster = false;
    let cluster_dict = {};
    return {
        all_comb,
        comb_data,
        link_data,
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
        svg_sankey
    }
})()