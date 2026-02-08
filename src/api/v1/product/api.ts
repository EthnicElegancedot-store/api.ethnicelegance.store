import express from "express";
import asyncHandler from "../../../utils/async-handler.js";
import response from "../../../utils/response.js";
import Product from "../../../schema/product.js";
import Review from "../../../schema/review.js";

const router = express.Router();

router.get(
  "/filter",
  asyncHandler(async (req, res) => {
    const {
      page,
      limit,
      category,
      subCategory,
      design,
      priceMin,
      priceMax,
      rating,
      searchQuery,
    } = req.query;

    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const searchTerm =
      typeof searchQuery === "string" ? searchQuery.trim() : "";

    const query: Record<string, any> = {
      ...(category && { category }),
      ...(subCategory && { subCategory }),
      ...(design && { design }),
      ...(rating && { averageRating: { $gte: Number(rating) } }),
      ...(priceMin || priceMax
        ? {
            price: {
              ...(priceMin && { $gte: Number(priceMin) }),
              ...(priceMax && { $lte: Number(priceMax) }),
            },
          }
        : {}),
      ...(searchTerm
        ? {
            $or: [
              { name: { $regex: searchTerm, $options: "i" } },
              { sku: { $regex: searchTerm, $options: "i" } },
              { category: { $regex: searchTerm, $options: "i" } },
              { subCategory: { $regex: searchTerm, $options: "i" } },
              { design: { $regex: searchTerm, $options: "i" } },
            ],
          }
        : {}),
    };

    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .skip(skip)
      .limit(limitNumber)
      .lean();

    return response.success(res, "Products are successfully retrieved", 200, {
      products,
      total,
      page: pageNumber,
      limit: limitNumber,
    });
  }),
);

router.get(
  "/:productId",
  asyncHandler(async (req, res) => {
    const productId = req.params.productId;

    if (!productId) {
      return response.failure(res, "productId is invalid", 400);
    }

    const getProduct = await Product.findById(productId, {
      __v: 0,
      updatedAt: 0,
      createdAt: 0,
    }).lean();

    const getReview = await Review.find({ productId: productId }).lean();

    if (!getProduct) {
      return response.failure(res, "Product not found", 404);
    }
    const formattedProduct = {
      ...getProduct,
      review: getReview,
    };

    return response.success(
      res,
      "Product is successfully retrieved",
      200,
      formattedProduct,
    );
  }),
);

export default router;
