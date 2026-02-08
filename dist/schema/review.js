import mongoose from "mongoose";
const reviewSchema = new mongoose.Schema({
    comment: { type: String, trim: true },
    rating: {
        type: Number,
        required: true,
        min: 0.5,
        max: 5,
        set: (v) => (v < 0.5 ? 0.5 : v > 5 ? 5 : v),
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
}, { timestamps: true });
reviewSchema.statics.calcAverageRatings = async function (productId) {
    const stats = await this.aggregate([
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
    this.constructor.calcAverageRatings(this.productId);
});
reviewSchema.pre(/^findOneAnd/, async function () {
    this._docToUpdate = await this.model.findOne(this.getQuery());
});
reviewSchema.post(/^findOneAnd/, async function () {
    if (this._docToUpdate) {
        await this._docToUpdate.constructor.calcAverageRatings(this._docToUpdate.productId);
    }
});
const Review = mongoose.model("Review", reviewSchema);
export default Review;
