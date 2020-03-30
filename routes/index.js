var express = require("express");
var router = express.Router();
var CBModel = require("../models/get_comb_data");
var PTModel = require("../models/patent");
var WBModel = require("../models/weibo");

// var InsertModel = require("../models/test_co");                  
/* GET home page. */
router.get("/", function (req, res, next) {
    res.render("index", {
        title: "Data Visualization"
    });
});

router.get("/paper", function (req, res, next) {
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

router.get("/patent", function (req, res, next) {
    PTModel.find({
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


router.get("/weibo", function (req, res, next) {
    WBModel.find({
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