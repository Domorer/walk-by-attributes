let option = (function () {

    let prefix = ['j-a-t', 'j-a', 'j-t', 'a-t'];

    prefix.forEach(Element => {
        $('#' + Element).on('click', function () {
            scatter.drawScatter(variable.attrs_data[Element]);
        })
    })

    return {

    }
})()