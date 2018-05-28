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
EventSchema.pre('findOneAndUpdate', function (next) {
  UserEvents.find({ $or: [ 
    { start : { $lt: this._update.start }, end : { $gt: this._update.start } },
    { start : { $lt: this._update.end }, end : { $gt: this._update.end } },
    { start : { $gt: this._update.start }, end : { $lt: this._update.end } }
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