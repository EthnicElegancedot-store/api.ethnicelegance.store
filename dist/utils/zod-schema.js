import { SIGNUPSANITIZE, VERIFYEMAILSANITIZE, LOGINSANITIZE, FORGOTPASSWORDSANITIZE, ADDPRODUCTSANITIZE, ADDVARIANTSSANITIZE, CREATECOUPONSANITIZE, CREATEADDRESSSANITIZE, } from "./type.js";
export function whichZodSchema(route) {
    if (route.startsWith("/sign-up")) {
        return SIGNUPSANITIZE;
    }
    if (route.startsWith("/verify-email")) {
        return VERIFYEMAILSANITIZE;
    }
    if (route.startsWith("/login")) {
        return LOGINSANITIZE;
    }
    if (route.startsWith("/forgot-password")) {
        return FORGOTPASSWORDSANITIZE;
    }
    if (route.startsWith("/verify-forgot-password")) {
        return VERIFYEMAILSANITIZE;
    }
    if (route.startsWith("/product/create")) {
        return ADDPRODUCTSANITIZE;
    }
    if (route.startsWith("/product/variant/add")) {
        return ADDVARIANTSSANITIZE;
    }
    if (route.startsWith("/coupon/create")) {
        return CREATECOUPONSANITIZE;
    }
    if (route.startsWith("/address/create")) {
        return CREATEADDRESSSANITIZE;
    }
}
