import { Response } from "express";

/**
 * Standardized response handler for API responses.
 * Provides methods for sending success and failure responses.
 * @param res - Express Response object
 * @param message - Message describing the response
 * @param data - Optional data to include in the response
 * @param statusCode - Optional HTTP status code
 * @returns JSON response with standardized structure
 **/

const response = {
  success: (
    res: Response,
    message: string,
    statusCode?: number,
    data?: any,
  ) => {
    return res.status(statusCode || 200).json({
      status: true,
      message,
      data: data || null,
    });
  },
  failure: (
    res: Response,
    message: string,
    statusCode?: number,
    data?: any,
  ) => {
    return res.status(statusCode || 500).json({
      status: false,
      message,
      data: data || null,
    });
  },
};

export default response;
