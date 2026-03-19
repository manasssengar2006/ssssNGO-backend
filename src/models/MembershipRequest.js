const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  userId: String,

  name: String,
  fatherName: String,
  motherName: String,

  phone: String,
  email: String,

  aadhaarNumber: String,
  panNumber: String,

  annualIncome: String,
  incomeSource: String,

  fatherOccupation: String,
  motherOccupation: String,

  aadhaarAddress: String,
  currentAddress: String,

  // NEW
  maritalStatus: String,
  wifeName: String,
  children: String,
  childrenNames: String,

  photoFile: String,
  aadhaarFile: String,
  panFile: String,

  status: {
    type: String,
    default: "pending",
  },
}, { timestamps: true });

module.exports = mongoose.model("MembershipRequest", schema);