export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const getRedirectPathByRole = (role) => {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "hr":
      return "/hr/dashboard";
    default:
      return "/candidate/dashboard";
  }
};
