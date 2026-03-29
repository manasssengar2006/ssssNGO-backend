const mongoose = require("mongoose");

const membershipSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
    },

    // BASIC
    name: {
      type: String,
      required: true,
      trim: true,
    },
    fatherName: String,
    motherName: String,

    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },

    // IDENTITY
    aadhaarNumber: String,
    panNumber: String,

    // LOCATION ✅ UPDATED
    country: String,   // 🔥 ADDED
    state: String,
    city: String,
    pincode: String,

    // INCOME
    annualIncome: String,
    incomeSource: String,

    fatherOccupation: String,
    motherOccupation: String,

    // ADDRESS
    aadhaarAddress: String,
    currentAddress: String,

    // FAMILY
    siblings: String,

    maritalStatus: String,
    wifeName: String,
    children: String,
    childrenNames: String,

    // DOCUMENTS ✅ IMPROVED NAMING
    photoFile: String,
    aadhaarFile: String,
    panFile: String,

    // STATUS
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"], // 🔥 better control
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MembershipRequest", membershipSchema);