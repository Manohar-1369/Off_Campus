const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  domain: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Student", studentSchema);
