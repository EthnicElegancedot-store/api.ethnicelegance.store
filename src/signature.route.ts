import e from "express";
import express from "express";
import asyncHandler from "./utils/async-handler.js";
import { v2 as cloudinary } from "cloudinary";
import response from "./utils/response.js";
import checkCookies from "./utils/m-check-cookies.js";

const router = express.Router();

router.get(
  "/signature",
  checkCookies,
  asyncHandler(async (req, res) => {
    const timestamp = Math.round(Date.now() / 1000);

    const paramsToSign = {
      folder: "products",
      timestamp,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET as string,
    );

    return response.success(res, "Signature generated successfully", 200, {
      timestamp,
      signature,
    });
  }),
);

export default router;
