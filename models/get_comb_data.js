var mongoose = require("mongoose")
const Schema = mongoose.Schema;

const getSchema = new Schema({
    wt: String,
    sl: String,
    rl: String,
    comb:String
}, {
    collection: 'Chicago_hierarchical'
});

var CBModel = mongoose.model('Chicago_hierarchical', getSchema);
CBModel.createIndexes({"wt":1, 'sl':1, 'rl':1});

module.exports = CBModel;