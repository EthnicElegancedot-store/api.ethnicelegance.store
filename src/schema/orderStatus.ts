import mongoose from "mongoose";

const orderStatusSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["Order", "Shipped", "Out of Delivery", "Delivered", "Cancelled"],
      required: true,
    },
    description: { type: String, required: true },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
  },
  { timestamps: true },
);

const OrderStatus = mongoose.model("OrderStatus", orderStatusSchema);
export default OrderStatus;
