var mongoose = require("mongoose")
const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

const poSchema = new Schema({
    id: String,
    latlng: Array,
    basic_attr: Array
}, {
    collection: 'allRate_1'
});

var BDModel = mongoose.model('allRate_1', poSchema);
BDModel.createIndexes({"id":1});

module.exports = BDModel;