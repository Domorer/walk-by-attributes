var mongoose = require("mongoose")
const Schema = mongoose.Schema;

const getSchema = new Schema({
    wt: String,
    sl: String,
    rl: String,
    comb:String
}, {
    collection: 'Hierarchical_cluster'
});

var CBModel = mongoose.model('Hierarchical_cluster', getSchema);
CBModel.createIndexes({"wt":1, 'sl':1, 'rl':1});

module.exports = CBModel;