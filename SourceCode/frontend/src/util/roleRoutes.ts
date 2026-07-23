const ROLE_CUSTOMER = "ROLE_CUSTOMER";
const ROLE_SELLER = "ROLE_SELLER";
const ROLE_ADMIN = "ROLE_ADMIN";

export const getAccountRoute = (role?: string | null): string => {
  switch (role) {
    case ROLE_SELLER:
      return "/seller/account";
    case ROLE_ADMIN:
      return "/admin/account";
    case ROLE_CUSTOMER:
    default:
      return "/account";
  }
};

export const getHomeRoute = (role?: string | null): string => {
  switch (role) {
    case ROLE_SELLER:
      return "/seller";
    case ROLE_ADMIN:
      return "/admin";
    case ROLE_CUSTOMER:
    default:
      return "/";
  }
};
