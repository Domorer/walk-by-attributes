var express = require("express");
var router = express.Router();
var CBModel = require("../models/get_comb_data");


// var InsertModel = require("../models/test_co");
/* GET home page. */
router.get("/", function (req, res, next) {
    res.render("index", {
        title: "E-commerce"
    });
});

router.get("/comb_data", function (req, res, next) {
    CBModel.find({
        wt: req.query.wt,
        sl: req.query.sl,
        rl: req.query.rl,
        comb: req.query.comb,
    }, function (error, data) {
        if (error) console.log(error);
        else {
            res.json(data);
        }
    })

});


module.exports = router;