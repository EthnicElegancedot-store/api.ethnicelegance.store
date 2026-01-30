/**
 * Array of allowed admin emails from environment variable
 * Used to restrict admin access to specific email addresses
 * @module isAdminEmail
 * @returns {string[]} Array of allowed admin email addresses
 */
export const isAdminEmail = [
  ...process.env
    .ADMIN_EMAILS!.toLowerCase()
    .split(",")
    .map((email) => email.trim()),
];
