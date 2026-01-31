import mongoose, { Types } from "mongoose";
import { ReviewDocument, ReviewModel } from "./types.js";

interface ReviewQueryHelpers {
  _docToUpdate?: ReviewDocument | null;
}

const reviewSchema = new mongoose.Schema<
  ReviewDocument,
  ReviewModel,
  {},
  ReviewQueryHelpers
>(
  {
    comment: { type: String, trim: true },
    rating: {
      type: Number,
      required: true,
      min: 0.5,
      max: 5,
      set: (v: number) => (v < 0.5 ? 0.5 : v > 5 ? 5 : v),
    },
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

reviewSchema.statics.calcAverageRatings = async function (
  productId: Types.ObjectId,
) {
  const stats = await this.aggregate<{
    _id: Types.ObjectId;
    avgRating: number;
    count: number;
  }>([
    { $match: { productId } },
    {
      $group: {
        _id: "$productId",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  await mongoose.model("Product").findByIdAndUpdate(productId, {
    averageRating: stats[0]?.avgRating ?? 0,
    ratingCount: stats[0]?.count ?? 0,
  });
};

reviewSchema.post("save", function () {
  (this.constructor as ReviewModel).calcAverageRatings(this.productId!);
});

reviewSchema.pre(
  /^findOneAnd/,
  async function (
    this: mongoose.Query<any, ReviewDocument> & ReviewQueryHelpers,
  ) {
    this._docToUpdate = await this.model.findOne(this.getQuery());
  },
);

reviewSchema.post(
  /^findOneAnd/,
  async function (
    this: mongoose.Query<any, ReviewDocument> & ReviewQueryHelpers,
  ) {
    if (this._docToUpdate) {
      await (this._docToUpdate.constructor as ReviewModel).calcAverageRatings(
        this._docToUpdate.productId!,
      );
    }
  },
);

const Review = mongoose.model<ReviewDocument, ReviewModel>(
  "Review",
  reviewSchema,
);

export default Review;
