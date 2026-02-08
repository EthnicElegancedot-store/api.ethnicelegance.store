import express from "express";
import asyncHandler from "../../../utils/async-handler.js";
import response from "../../../utils/response.js";
import Coupon from "../../../schema/coupon.js";
import Product from "../../../schema/product.js";
const router = express.Router();
router.post("/code/apply", asyncHandler(async (req, res) => {
    const { code, orderValue, productIds } = req.body;
    if (!code || !orderValue || !Array.isArray(productIds)) {
        return response.failure(res, "Code, order value, and product IDs are required", 400);
    }
    const currentDate = new Date();
    const coupon = await Coupon.findOne({
        code: code.toString().toUpperCase(),
        validFrom: { $lte: currentDate },
        validTill: { $gte: currentDate },
        $expr: { $lt: ["$usedCount", "$usageLimit"] },
    })
        .populate("applicableTo")
        .lean();
    if (!coupon) {
        return response.failure(res, "Invalid or expired coupon", 404);
    }
    if (coupon.minOrderValue && Number(orderValue) < coupon.minOrderValue) {
        return response.failure(res, `Order value must be at least ${coupon.minOrderValue}`, 400);
    }
    // ---------- COUNT QUANTITY ----------
    const quantityMap = productIds.reduce((acc, p) => {
        const id = p._id.toString();
        acc[id] = (acc[id] || 0) + 1;
        return acc;
    }, {});
    const productIdsUnique = Object.keys(quantityMap);
    // ---------- FIND APPLICABLE PRODUCT IDS ----------
    const applicableIdSet = new Set(coupon.applicableTo.map((p) => p._id.toString()));
    const discountedOnceIds = productIdsUnique.filter((id) => applicableIdSet.has(id));
    if (discountedOnceIds.length === 0) {
        return response.failure(res, "Coupon is not applicable to selected products", 400);
    }
    // ---------- FETCH PRODUCTS ----------
    const products = await Product.find({
        _id: { $in: productIdsUnique },
    }).lean();
    let totalAmount = 0;
    const discountProducts = [];
    for (const product of products) {
        const id = product._id.toString();
        const qty = quantityMap[id];
        // Apply discount ONLY ONCE per product
        if (discountedOnceIds.includes(id)) {
            const discountedPrice = product.price - (product.price * coupon.discount) / 100;
            totalAmount += discountedPrice; // discounted once
            totalAmount += product.price * (qty - 1); // remaining full price
            discountProducts.push({
                ...product,
                quantity: qty,
                discountedOncePrice: discountedPrice,
                fullPriceQuantity: qty - 1,
            });
        }
        else {
            totalAmount += product.price * qty;
        }
    }
    await Coupon.updateOne({ _id: coupon._id }, { $inc: { usedCount: 1 } });
    return response.success(res, "Coupon applied successfully", 200, {
        code: coupon.code,
        offer: `${coupon.discount}% off (once per product)`,
        discountProducts,
        amount: totalAmount,
    });
}));
export default router;
