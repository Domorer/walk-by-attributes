var mongoose = require("mongoose")
const Schema = mongoose.Schema;

const getSchema = new Schema({
    wt: Number,
    sl: Number,
    rl: Boolean,
    comb:String
}, {
    collection: 'weibo'
});

var WBModel = mongoose.model('weibo', getSchema);
WBModel.createIndexes({"wt":1, 'sl':1, 'rl':1});

module.exports = WBModel;