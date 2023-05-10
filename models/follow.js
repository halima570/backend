const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Follow = new Schema({
  username: {
    type: String,
  },
 follow: {
    type: [String],
   
  }
}
  )


module.exports = mongoose.model('follow',Follow)