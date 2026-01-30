import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    addressLine3: { type: String },
    city: { type: String, required: true },
    state: { type: String },
    country: { type: String, required: true, default: "India" },
    pinCode: { type: Number, required: true },
    phoneNo: { type: Number, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

const Address = mongoose.model("Address", addressSchema);
export default Address;
