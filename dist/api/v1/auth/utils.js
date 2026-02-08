import jwt from "jsonwebtoken";
export function createAuthToken(_id, email, role) {
    const token = jwt.sign({ _id, email, role }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
    return token;
}
export async function verifyAuthToken(token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
}
