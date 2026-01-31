import express from "express";
import asyncHandler from "../../../utils/async-handler.js";
import checkCookies from "../../../utils/m-check-cookies.js";
import response from "../../../utils/response.js";
import Product from "../../../schema/product.js";
import Address from "../../../schema/address.js";
import razorpayInstance from "../../../libs/razorpay.js";
import Order from "../../../schema/order.js";
import OrderStatus from "../../../schema/orderStatus.js";
import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils.js";
import order from "../../../schema/order.js";
import AddToCart from "../../../schema/addtocart.js";

const router = express.Router();

router.post(
  "/create",
  checkCookies,
  asyncHandler(async (req, res) => {
    const { amount, offer, name, email, address } = req.body;

    const isAddressExist = await Address.findById({ _id: address._id }).lean();

    if (!isAddressExist) {
      return response.failure(res, "Address not found", 404);
    }

    const isAddToCartProductsExist = await AddToCart.find(
      {
        userId: req?._id!,
      },
      { productId: 1 },
    );

    if (isAddToCartProductsExist.length === 0) {
      return response.failure(res, "Product not found", 404);
    }

    const createOrder = await razorpayInstance.orders.create({
      amount: amount,
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
      notes: {
        name: name,
        products: JSON.stringify(isAddToCartProductsExist),
        email: email,
        offer: offer,
        address: address,
      },
    });

    const order = await Order.create({
      razorpayOrderId: createOrder.id,
      amount: amount,
      userId: req?._id!,
      status: createOrder.status,
      currency: createOrder.currency,
      receipt: createOrder.receipt,
      notes: createOrder.notes,
    });

    return response.success(res, "Order created successfully", 201, {
      order,
      razorpayOrder: createOrder,
    });
  }),
);

router.get(
  "/verify",
  checkCookies,
  asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    if (!orderId) {
      return response.failure(res, "Order ID is required", 400);
    }

    const order = await Order.findOne({
      $and: [{ _id: orderId }, { userId: req?._id! }],
    }).lean();

    if (!order) {
      return response.failure(res, "Order not found", 404);
    }
  }),
);

router.post(
  "/webhook",
  asyncHandler(async (req, res) => {
    const webhookSignature = req.get("X-Razorpay-Signature")!;

    const isWebhookValid = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET!,
    );

    if (!isWebhookValid) {
      return response.failure(res, "Invalid webhook signature", 400);
    }

    const paymentDetails = req.body.payload.payment.entity;

    const createOrderStatus = await OrderStatus.create({
      orderId: paymentDetails._id,
      status: "Order",
      description: "Order has been placed successfully",
      productId: paymentDetails.productId,
      userId: paymentDetails.userId,
    });

    if (req.body.event === "payment.captured") {
      // Update order status to paid
      await AddToCart.deleteMany({ userId: paymentDetails.userId });
    }
    if (req.body.event === "payment.failed") {
      // Update order status to failed
    }

    return response.success(res, "Webhook received successfully", 200, {
      order: paymentDetails,
      orderStatus: createOrderStatus,
    });
  }),
);

export default router;
