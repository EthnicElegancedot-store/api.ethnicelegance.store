import { Model, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  role: "USER" | "ADMIN";
  addresses: Array<string>;
}

export interface UserDocument extends IUser, Document {}

export interface UserModel extends Model<UserDocument> {
  /**
   * This method checks if a user with the given email exists in the database.
   * @param email
   * @return Promise that resolves to true if the user exists, false otherwise.
   */
  isUserExists(email: string): Promise<boolean>;

  /**
   * This method hashes the given password using a secure hashing algorithm.
   * @param password
   * @return Promise that resolves to the hashed password.
   */
  hashPassword(password: string): Promise<string>;

  /**
   * This method compares a plain text password with a hashed password.
   * @param password
   * @param hashedPassword
   * @return Promise that resolves to true if the passwords match, false otherwise.
   */
  comparePassword(password: string, hashedPassword: string): Promise<boolean>;

  /**
   * This method updates the password for the user with the given email.
   * @param email
   * @param newPassword
   * @return Promise that resolves to the updated user document.
   */
  updatePassword(email: string, newPassword: string): Promise<any>;
}
