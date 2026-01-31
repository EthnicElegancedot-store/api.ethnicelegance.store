import express from "express";
import asyncHandler from "../../../utils/async-handler.js";
import response from "../../../utils/response.js";
import Product from "../../../schema/product.js";
import Watchlist from "../../../schema/watchlist.js";
import checkCookies from "../../../utils/m-check-cookies.js";

const router = express.Router();

router.get(
  "/:productId",
  checkCookies,
  asyncHandler(async (req, res) => {
    const productId = req.params.productId;

    if (!productId) {
      return response.failure(res, "Product ID is required", 404);
    }

    const productExist = await Product.findById(productId).lean();

    if (!productExist) {
      return response.failure(res, "Product not found", 404);
    }

    const newWatchlist = await Watchlist.create({
      productId: productExist._id,
      userId: req?._id!,
    });

    return response.success(
      res,
      "Product added to watchlist successfully",
      202,
      newWatchlist,
    );
  }),
);

router.get(
  "/:productId",
  checkCookies,
  asyncHandler(async (req, res) => {
    const productId = req.params.productId;

    if (!productId) {
      return response.failure(res, "Product ID is required", 404);
    }

    const productExist = await Product.findById(productId).lean();

    if (!productExist) {
      return response.failure(res, "Product not found", 404);
    }

    const isExistWatchlist = await Watchlist.findOne({
      $and: [{ productId: productExist._id }, { userId: req?._id! }],
    });

    if (!isExistWatchlist) {
      return response.failure(res, "Product not in watchlist", 404);
    }

    return response.success(
      res,
      "Watchlist get successfully",
      202,
      isExistWatchlist,
    );
  }),
);

router.delete(
  "/:productId",
  checkCookies,
  asyncHandler(async (req, res) => {
    const productId = req.params.productId;

    if (!productId) {
      return response.failure(res, "Product ID is required", 404);
    }

    const productExist = await Product.findById(productId).lean();

    if (!productExist) {
      return response.failure(res, "Product not found", 404);
    }

    const isExistWatchlist = await Watchlist.findOneAndDelete({
      $and: [{ productId: productExist._id }, { userId: req?._id! }],
    });

    if (!isExistWatchlist) {
      return response.failure(res, "Product not in watchlist", 404);
    }

    return response.success(
      res,
      "Product removed from watchlist successfully",
      202,
      isExistWatchlist,
    );
  }),
);

export default router;
