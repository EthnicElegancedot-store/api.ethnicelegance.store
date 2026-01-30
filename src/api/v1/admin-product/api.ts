import express from "express";
import asyncHandler from "../../../utils/async-handler.js";
import response from "../../../utils/response.js";
import checkCookies from "../../../utils/m-check-cookies.js";
import InputSensitization from "../../../utils/m-input-sensitization.js";
import Product from "../../../schema/product.js";
import mongoose from "mongoose";
import { log } from "console";

const router = express.Router();

// Create Product
router.post(
  "/product/create",
  checkCookies,
  InputSensitization,
  asyncHandler(async (req, res) => {
    const createProduct = await Product.create({
      ...req.body,
    });

    return response.success(
      res,
      "Product created successfully",
      200,
      createProduct,
    );
  }),
);

// Add Product Variant
router.post(
  "/product/variant/add/:productId",
  checkCookies,
  InputSensitization,
  asyncHandler(async (req, res) => {
    if (!req.params.productId) {
      return response.failure(res, "Product ID is required", 400);
    }
    const product = await Product.findByIdAndUpdate(
      {
        _id: req.params.productId,
      },
      {
        $push: { variants: req.body },
      },
      {
        new: true,
      },
    ).lean();

    if (!product) {
      return response.failure(res, "Product not found", 404);
    }

    return response.success(res, "Product variant added successfully", 200, {
      variants: product.variants,
    });
  }),
);

// Edit Product
router.patch(
  "/product/edit/:productId",
  checkCookies,
  asyncHandler(async (req, res) => {
    if (!req.params.productId) {
      return response.failure(res, "Product ID is required", 400);
    }
    const updatedProduct = await Product.findByIdAndUpdate(
      {
        _id: req.params.productId,
      },
      {
        $set: req.body,
      },
      { new: true },
    ).lean();

    if (!updatedProduct) {
      return response.failure(res, "Product not found", 404);
    }

    return response.success(
      res,
      "Product updated successfully",
      200,
      updatedProduct,
    );
  }),
);

// Edit Product Variant
router.patch(
  "/product/variant/edit/:productId/:variantId",
  checkCookies,
  asyncHandler(async (req, res) => {
    if (!req.params.productId || !req.params.variantId) {
      return response.failure(
        res,
        "Product ID and Variant ID are required",
        400,
      );
    }

    const product = await Product.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(req.params.productId as string),
        "variants._id": new mongoose.Types.ObjectId(
          req.params.variantId as string,
        ),
      },
      {
        $set: {
          "variants.$": { ...req.body },
        },
      },
      { new: true },
    ).lean();

    if (!product) {
      return response.failure(res, "Product or Variant not found", 404);
    }

    return response.success(res, "Product variant updated successfully", 200, {
      variants: product.variants,
    });
  }),
);

// Delete a product variant
router.delete(
  "/product/variant/delete/:productId/:variantId",
  checkCookies,
  asyncHandler(async (req, res) => {
    if (!req.params.productId || !req.params.variantId) {
      return response.failure(
        res,
        "Product ID and Variant ID are required",
        400,
      );
    }

    const product = await Product.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(req.params.productId as string),
      },
      {
        $pull: {
          variants: {
            _id: new mongoose.Types.ObjectId(req.params.variantId as string),
          },
        },
      },
      { new: true },
    ).lean();

    if (!product) {
      return response.failure(res, "Product or Variant not found", 404);
    }

    return response.success(
      res,
      "Product variant deleted successfully",
      200,
      [],
    );
  }),
);

// Delete whole Product
router.delete(
  "/product/delete/:productId",
  checkCookies,
  asyncHandler(async (req, res) => {
    if (!req.params.productId) {
      return response.failure(res, "Product ID is required", 400);
    }

    const deletedProduct = await Product.findByIdAndDelete(
      req.params.productId,
    ).lean();

    if (!deletedProduct) {
      return response.failure(res, "Product not found", 404);
    }

    return response.success(
      res,
      "Product deleted successfully",
      200,
      deletedProduct,
    );
  }),
);

export default router;
