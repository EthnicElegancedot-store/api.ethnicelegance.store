import express from "express";
import asyncHandler from "../../../utils/async-handler.js";
import response from "../../../utils/response.js";
import Product from "../../../schema/product.js";

const router = express.Router();

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const productId = req.params.id;

    if (!productId) {
      return response.failure(res, "productId is invalid", 400);
    }

    const getProduct = await Product.findById(productId).lean();

    if (!getProduct) {
      return response.failure(res, "Product not found", 404);
    }

    return response.success(
      res,
      "Product is successfully retrieved",
      200,
      getProduct,
    );
  }),
);

export default router;
