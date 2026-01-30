import jwt from "jsonwebtoken";

export function createAuthToken(_id: string, email: string, role: string) {
  const token = jwt.sign(
    { _id, email, role },
    process.env.JWT_SECRET! as string,
    {
      expiresIn: "30d",
    },
  );
  return token;
}

export async function verifyAuthToken(token: string) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET! as string) as {
    _id: string;
    email: string;
    role: string;
  };
  return decoded;
}
