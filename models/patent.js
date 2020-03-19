var mongoose = require("mongoose")
const Schema = mongoose.Schema;

const getSchema = new Schema({
    wt: Number,
    sl: Number,
    rl: Boolean,
    comb:String
}, {
    collection: 'patent'
});

var PTModel = mongoose.model('patent', getSchema);
PTModel.createIndexes({"wt":1, 'sl':1, 'rl':1});

module.exports = PTModel;