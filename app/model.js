// Pulls Mongoose dependency for creating schemas
var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;


var TripSchema = new Schema({
    tripID: {type: String, required: true},
    places: [PlacesSchema],
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
})

var PlacesSchema = new Schema({
    placeID: {type: String, required: true},
    placeName: {type: String, required: true},
    location: {type: [Number], required: true},
})


// Sets the created_at parameter equal to the current time
TripSchema.pre('save', function(next){
    now = new Date();
    this.updated_at = now;
    if(!this.created_at) {
        this.created_at = now
    }
    next();
});

// Indexes this schema in 2dsphere format (critical for running proximity searches)
PlacesSchema.index({location: '2dsphere'});

// Exports the UserSchema for use elsewhere. Sets the MongoDB collection to be used as: "scotch-users"
module.exports = mongoose.model('scotch-user', TripSchema);

