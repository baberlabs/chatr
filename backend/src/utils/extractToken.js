import { createError as err, ErrorCodes } from "../errors.js";

export const extractToken = ({ req, socket }) => {
  let token;

  if (req) token = extractHTTPToken(req);
  if (socket) token = extractSocketToken(socket);

  if (!token) throw err(ErrorCodes.AUTH_TOKEN_REQUIRED);

  return token;
};

const extractHTTPToken = (req) => {
  const h = req.headers;
  const t = req.cookies?.jwt;
  const c = req.headers?.cookie;

  return bearer(h) || t || cookieValue(c, "jwt");
};

const extractSocketToken = (socket) => {
  const h = socket.handshake?.headers;
  const t = socket.handshake?.auth?.token;
  const c = socket.handshake?.headers?.cookie;

  return t || bearer(h) || cookieValue(c, "jwt");
};

const bearer = (headers = {}) => {
  const v = headers.authorization || headers.Authorization;
  return v && v.startsWith("Bearer ") ? v.slice(7).trim() : undefined;
};

const cookieValue = (cookieHeader = "", name = "jwt") => {
  return cookieHeader
    .split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith(`${name}=`))
    ?.slice(name.length + 1);
};
