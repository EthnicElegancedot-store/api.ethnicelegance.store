import redisClient from "../libs/redis.js";

/**
 * Generates a numeric OTP 6 digits.
 * Store in Redis with an expiry time.
 * @param label Label for the OTP (e.g., "sign-up", "login").
 * @param email Email address to send the OTP to.
 * @param expire Expiry time in minutes.
 * @returns A numeric OTP of the specified length.
 */
export default async function generateOTP(
  label: string,
  data: Record<string, any>,
  expire: number,
): Promise<{ otp: number; otpSession: any }> {
  const otp = +Math.random().toString().slice(2, 8);

  const otpSession = await redisClient.set(
    `otp?${label}=${data.email}`,
    JSON.stringify({
      ...data,
      code: otp,
    }),
    {
      EX: expire * 60,
    },
  );

  return {
    otp,
    otpSession,
  };
}
