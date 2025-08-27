export const extractToken = (req) => {
  if (req.cookies?.jwt) {
    return req.cookies.jwt;
  }
  return null;
};
