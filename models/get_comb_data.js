var mongoose = require("mongoose")
const Schema = mongoose.Schema;

const getSchema = new Schema({
    wt: Number,
    sl: Number,
    rl: Boolean,
    comb:String
}, {
    collection: 'deep_walk'
});

var CBModel = mongoose.model('deep_walk', getSchema);
CBModel.createIndexes({"wt":1, 'sl':1, 'rl':1});

module.exports = CBModel;