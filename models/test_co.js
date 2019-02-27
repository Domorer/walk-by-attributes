var mongoose = require("mongoose")
const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

const TestSchema = new Schema({
    well_1:String,
    well_2:String,
    value: Array,
}, {
    collection: 'insert_test'
});

var TestModel = mongoose.model('insert_test', TestSchema);
TestModel.createIndexes({"well_1":1});
TestModel.createIndexes({"well_2":1});

module.exports = TestModel;