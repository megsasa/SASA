var mongoose = require('mongoose');

var EventSchema = new mongoose.Schema({
   userId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    unique: false,
    required: true,
    trim: true
  },
  start: {
    type: Date,
    unique: false,
    required: true
  },
  end: {
    type: Date,
    unique: false,
    required: true
  },
  color:{
  type: String,
  }
});
EventSchema.pre('save', function (next) {
  var self = this;
  UserEvents.find({ $or: [ 
    { start : { $lt: self.start }, end : { $gt: self.start } },
    { start : { $lt: self.end }, end : { $gt: self.end } },
    { start : { $gt: self.start }, end : { $lt: self.end } }
  ]}, function (err, docs) {
      if (!docs.length){
          next();
      }else{                
          console.log('Overlapping detected ');
          next(new Error("Overlapping exists!"));
     }
  });
}) ;
EventSchema.pre('update', function (next) {
  var self = this;
  UserEvents.find({ $or: [ 
    { start : { $lt: self.start }, end : { $gt: self.start } },
    { start : { $lt: self.end }, end : { $gt: self.end } },
    { start : { $gt: self.start }, end : { $lt: self.end } }
  ]}, function (err, docs) {
      if (!docs.length){
          next();
      }else{                
          console.log('Overlapping detected ');
          next(new Error("Overlapping exists!"));
      }
  });
}) ;
var UserEvents = mongoose.model('UserEvents', EventSchema);
module.exports = UserEvents;