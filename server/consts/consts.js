const roles = {
  admin: "admin",
  user: "user",
};
const userSortKey = [
  "username",
  "email",
  "role",
  "isVerify",
  "createdAt",
  "updatedAt",
];
const linkSortKey = ["createdAt", "expiryDate"];

module.exports = {
  roles,
  userSortKey,
  linkSortKey,
};
