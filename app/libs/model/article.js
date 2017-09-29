var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Article
var Images = new Schema({
	kind: {
		type: String,
		enum: ['thumbnail', 'detail'],
		required: true
	},
	url: { type: String, required: true }
});

var Article = new Schema({
	title: { type: String, required: true, index: true },
	author: { type: String, required: true, index: true },
	description: { type: String, required: true, index: true },
	images: [Images],
	modified: { type: Date, default: Date.now }
});

Article.path('title').validate(function (v) {
	return v.length > 5 && v.length < 70;
});

// Add an index for full text search
Article.index({'$**': 'text'},{ "background": false });

module.exports = mongoose.model('Article', Article);