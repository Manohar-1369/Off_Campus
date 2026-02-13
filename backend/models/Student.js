import mongoose from "mongoose";

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
  },
  notify: {
    type: Boolean,
    default: true
  }
});

export default mongoose.model("Student", studentSchema);
