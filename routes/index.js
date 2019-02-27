var express = require("express");
var router = express.Router();


// var InsertModel = require("../models/test_co");
/* GET home page. */
router.get("/", function (req, res, next) {
    res.render("index", {
        title: "E-commerce"
    });
});


module.exports = router;