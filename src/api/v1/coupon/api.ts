import express from "express";
import asyncHandler from "../../../utils/async-handler.js";
import response from "../../../utils/response.js";
import Coupon from "../../../schema/coupon.js";
import checkCookies from "../../../utils/m-check-cookies.js";

const router = express.Router();

router.get(
  "/code/apply",
  checkCookies,
  asyncHandler(async (req, res) => {
    const { code, orderValue, productId } = req.query;

    if (!code || !orderValue || !productId) {
      return response.failure(
        res,
        "Code, order value, and product ID are required",
        400,
      );
    }

    const currentDate = new Date();

    const coupon = await Coupon.findOneAndUpdate(
      {
        code: code.toString().toUpperCase(),
        validFrom: { $lte: currentDate },
        validTill: { $gte: currentDate },

        $expr: {
          $lt: ["$usedCount", "$usageLimit"],
        },
      },
      {
        $inc: { usedCount: 1 },
      },
      { new: true },
    )
      .populate("applicableTo")
      .lean();
    console.log(coupon);

    if (!coupon) {
      return response.failure(res, "Invalid coupon code", 404);
    }

    if (coupon.minOrderValue && Number(orderValue) < coupon.minOrderValue) {
      return response.failure(
        res,
        `Order value must be at least ${coupon.minOrderValue} to use this coupon`,
        400,
      );
    }

    const isApplicableToProduct = coupon.applicableTo.filter(
      (product: Record<string, any>) =>
        product._id.toString() === productId.toString(),
    );

    if (isApplicableToProduct.length === 0) {
      return response.failure(
        res,
        "Coupon is not applicable to this product",
        400,
      );
    }

    return response.success(res, "Coupon is applicable to this product", 200, {
      finalAmount:
        isApplicableToProduct[0]?.price * (1 - coupon.discount / 100),
      code: coupon.code,
      offer: `${coupon.discount}% off`,
    });
  }),
);

export default router;
