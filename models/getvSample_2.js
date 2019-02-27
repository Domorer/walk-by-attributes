var mongoose = require("mongoose")
const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

const poSchema_2 = new Schema({
    id: String,
    latlng: Array,
    basic_attr: Array
}, {
    collection: 'allRate_2'
});

var BDModel_2 = mongoose.model('allRate_2', poSchema_2);
BDModel_2.createIndexes({"id":1});

module.exports = BDModel_2;