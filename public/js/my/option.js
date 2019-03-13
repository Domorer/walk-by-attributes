let option = (function () {

    let cs_dict = { 'O-P': 'P', 'O-R': 'R', 'O': 'O', 'O-P-R': 'PR' }
    let comb_len = 0;
    let optIndex = 0;//记录操作的index
    let comb_record = [];//记录操作的具体参数
    let tmp_fun = parameters.drawCount;
    let tmp_param = ["cited", '次', 'cited_chart'];

    //读取数据和初始化各窗口
    d3.json('data/cluster_all_comb.json', function (all_data) {
        console.log('all_data: ', all_data);
        variable.all_comb = all_data;
        scatter.drawScatter(all_data['conf']['O']);

        d3.csv('data/link.csv', function (error, link_data) {
            if (error)
                console.log(error);
            d3.json('data/info.json', function (error, info_dict) {
                if (error)
                    console.log(error);
                for (let i = 0; i < all_data['conf']['O'].length; i++) {
                    variable.cluster_dict[all_data['conf']['O'][i].id] = parseInt(all_data['conf']['O'][i].cluster);
                }
                variable.info_dict = info_dict;
                variable.link_data = link_data;
                // ForceChart.drawForce(link_data, info_dict, variable.cluster_dict);
            })


        })
    })

    //设置参数选择
    $('#confirm').on('click', function () {
        console.log(1)
        //获取当前各参数的选择情况
        comb_len = 0;
        variable.attr = 'conf';
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
        let tmp_comb = 'O';
        let p_checked = $('#P')[0].checked;
        let r_checked = $('#R')[0].checked;
        if (p_checked)
            tmp_comb += '-P';
        if (r_checked)
            tmp_comb += '-R';
        variable.pr = cs_dict[tmp_comb];
        console.log('variable.pr: ', variable.pr);

        //将操作数据记录并添加到dropdown
        comb_record.push([variable.attr, variable.pr]);
        let tmp_text = variable.attr + '-' + variable.pr;
        let tmp_option = $('<a></a>').text(tmp_text).attr("id", optIndex).attr('class', 'dropdown-item').on('click', function () {
            let tmpCombData = variable.all_comb[comb_record[this.id][0]][comb_record[this.id][1]];
        });
        $("#options").append(tmp_option);
        optIndex += 1;

        //根据参数选择获取对应数据
        console.log('variable.all_comb: ', variable.all_comb);

        let tmpCombData = variable.all_comb[variable.attr][variable.pr];
        scatter.drawScatter(tmpCombData);
    })

    return {
        tmp_fun,
        tmp_param
    }
})()