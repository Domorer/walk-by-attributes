let variable = (function () {

    let attrs_data;
    let comb_data;
    let svg_scatter = d3.select('#svg_scatter');
    let svg_brush = d3.select('#svg_brush');

    return {
        attrs_data,
        svg_scatter,
        comb_data,
        svg_brush
    }
})()