import mongoose from "mongoose";

const size = new mongoose.Schema({
  size: { type: String, required: true, trim: true },
  stock: { type: Number, required: true },
});

const variants = new mongoose.Schema({
  color: { type: String, required: true, trim: true },
  images: [{ type: String }],
  size: [size],
});

const productSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, trim: true },
    subCategory: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, trim: true, unique: true },
    description: { type: String, required: true, trim: true },
    productInformation: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
    price: { type: Number, required: true },
    design: {
      type: [String],
      enum: [
        "Floral Print",
        "Ethnic Print",
        "Abstract Print",
        "Solid",
        "Checks",
        "Stripes",
        "Bandhani",
        "Leheriya",
        "Tie & Dye",
        "Block Print",
      ],
      index: true,
    },
    label: { type: String, trim: true },
    averageRating: {
      type: Number,
      default: 0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    mrp: { type: Number, required: true },
    variants: [variants],
  },
  {
    timestamps: true,
  },
);

const Product = mongoose.model("Product", productSchema);

export default Product;
