import express from "express";
import asyncHandler from "../../../utils/async-handler.js";
import checkCookies from "../../../utils/m-check-cookies.js";
import response from "../../../utils/response.js";
import Review from "../../../schema/review.js";
import Product from "../../../schema/product.js";
const router = express.Router();
router.post("/create/:productId", checkCookies, asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    if (!productId) {
        return response.failure(res, "Product ID is required", 400);
    }
    const product = await Product.findById(productId).lean();
    if (!product) {
        return response.failure(res, "Product not found", 404);
    }
    const existingReview = await Review.findOne({
        productId: product._id,
        userId: req._id,
    });
    if (existingReview) {
        return response.failure(res, "You have already reviewed this product", 400);
    }
    const newReview = await Review.create({
        productId: product._id,
        userId: req._id,
        rating,
        comment,
    });
    return response.success(res, "Review created successfully", 201, newReview);
}));
router.patch("/edit/:reviewId", checkCookies, asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    if (!reviewId) {
        response.failure(res, "Review ID is required", 400);
    }
    const isExistReview = await Review.findOne({
        $and: [{ _id: reviewId }, { userId: req._id }],
    });
    if (!isExistReview) {
        return response.failure(res, "Review not found", 404);
    }
    const updatedReview = await Review.findByIdAndUpdate(reviewId, req.body, {
        new: true,
    });
    return response.success(res, "Review updated successfully", 200, updatedReview);
}));
router.delete("/delete/:reviewId", checkCookies, asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    if (!reviewId) {
        response.failure(res, "Review ID is required", 400);
    }
    const isExistReview = await Review.findOne({
        $and: [{ _id: reviewId }, { userId: req._id }],
    });
    if (!isExistReview) {
        return response.failure(res, "Review not found", 404);
    }
    await Review.findByIdAndDelete(reviewId);
    return response.success(res, "Review deleted successfully", 200);
}));
export default router;
