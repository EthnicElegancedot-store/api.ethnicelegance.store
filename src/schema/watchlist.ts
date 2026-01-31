import mongoose from "mongoose";

const watchListSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true },
);

const Watchlist = mongoose.model("Watchlist", watchListSchema);
export default Watchlist;
