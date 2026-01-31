import express from "express";
import asyncHandler from "../../../utils/async-handler.js";
import response from "../../../utils/response.js";
import Product from "../../../schema/product.js";
import AddToCart from "../../../schema/addtocart.js";
import checkCookies from "../../../utils/m-check-cookies.js";
import mongoose from "../../../libs/mongoose.js";

const router = express.Router();

router.get(
  "/create/:productId",
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

    const isExistCart = await AddToCart.find({
      $and: [{ "items.productId": productExist._id }, { userId: req?._id! }],
    });

    if (isExistCart.length > 0) {
      return response.failure(res, "Product already in cart", 404);
    }

    const addToCart = await AddToCart.create({
      userId: req?._id!,
      items: [
        {
          productId: productExist._id,
          quantity: 1,
          totalPrice: productExist.price,
        },
      ],
    });

    return response.success(
      res,
      "Product added to cart successfully",
      202,
      addToCart,
    );
  }),
);

router.post(
  "/update/:productId",
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

    const isExistCart = await AddToCart.find({
      $and: [{ "items.productId": productExist._id }, { userId: req?._id! }],
    });

    if (isExistCart.length === 0) {
      return response.failure(res, "Product not in cart", 404);
    }

    const updatedCart = await AddToCart.findOneAndUpdate(
      {
        $and: [{ "items.productId": productExist._id }, { userId: req?._id! }],
      },
      {
        $set: {
          "items.$.quantity": Math.max(1, req.body.quantity),
          "items.$.totalPrice":
            Math.max(1, req.body.quantity) * productExist.price,
        },
      },
      { new: true },
    );
    return response.success(
      res,
      "Product quantity updated successfully",
      202,
      updatedCart,
    );
  }),
);

router.get(
  "/all",
  checkCookies,
  asyncHandler(async (req, res) => {
    const cart = await AddToCart.findOne({
      userId: req._id!,
    })
      .populate("items.productId")
      .lean();

    if (!cart) {
      return response.failure(res, "Cart is empty", 404);
    }

    return response.success(
      res,
      "Add to cart get successfully",
      200,
      cart.items,
    );
  }),
);

router.delete(
  "/delete/:productId",
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

    const isExistCart = await AddToCart.findOneAndDelete({
      $and: [{ "items.productId": productExist._id }, { userId: req?._id! }],
    });

    if (!isExistCart) {
      return response.failure(res, "Product not in cart", 404);
    }

    return response.success(
      res,
      "Product removed from cart successfully",
      202,
      isExistCart,
    );
  }),
);

export default router;
