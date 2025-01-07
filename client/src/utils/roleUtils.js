export const getDefaultRouteForRole = (role) => {
  switch (role) {
    case "admin":
      return "/admin";
    case "user":
      return "/user";
    default:
      return "/";
  }
};
