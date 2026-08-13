[33me993fc2[m[33m ([m[1;36mHEAD -> [m[1;32mmaster[m[33m)[m main changes fix all issues
 SourceCode/backend/src/app.js                      |  39 [32m++[m[31m-[m
 SourceCode/backend/src/modules/ai/ai.service.js    | 247 [32m+++++++++++++++[m[31m-[m
 SourceCode/backend/src/modules/ai/rag/aiserver.js  | 313 [32m+[m[31m--------------------[m
 SourceCode/backend/src/modules/auth/auth.routes.js |  16 [32m+[m[31m-[m
 .../backend/src/modules/auth/auth.service.js       |   4 [32m+[m[31m-[m
 .../src/modules/auth/sellerAuth.controller.js      | 108 [32m++++++[m[31m-[m
 .../backend/src/modules/auth/sellerAuth.service.js |  39 [32m++[m[31m-[m
 .../backend/src/modules/brands/brand.repository.js |  54 [32m++[m[31m--[m
 SourceCode/frontend/src/App.css                    |   6 [32m+[m
 SourceCode/frontend/src/App.tsx                    |  28 [32m+[m[31m-[m
 SourceCode/frontend/src/Config/Api.ts              |  10 [32m+[m[31m-[m
 .../Seller/sellerAuthenticationSlice.ts            | 179 [32m++++++++++++[m
 .../src/admin/pages/Account/AdminAccount.tsx       |  28 [32m+[m[31m-[m
 .../admin/pages/Account/AdminChangePassword.tsx    | 133 [32m+++++++++[m
 .../src/admin/pages/Home Page/DealsTable.tsx       |   4 [32m+[m[31m-[m
 .../pages/BecomeSeller/SellerLoginForm.tsx         | 155 [32m+++++[m[31m-----[m
 .../pages/BecomeSeller/SellerPasswordLoginForm.tsx | 104 [32m+++++++[m
 .../src/customer/pages/Brands/PublicBrandList.tsx  |   5 [32m+[m[31m-[m
 .../src/customer/pages/ChatBot/ChatBot.tsx         | 279 [32m++++++++++++++++[m[31m--[m
 .../src/customer/pages/ChatBot/PromptMessage.tsx   |  19 [32m+[m[31m-[m
 .../src/customer/pages/ChatBot/ResponseMessage.tsx | 105 [32m++++++[m[31m-[m
 .../src/customer/pages/Home/Deals/DealCard.tsx     |  29 [32m+[m[31m-[m
 .../src/customer/pages/Home/Deals/Deals.tsx        |   8 [32m+[m[31m-[m
 .../frontend/src/seller/pages/Account/Profile.tsx  |  36 [32m+++[m
 .../seller/pages/Account/SellerChangePassword.tsx  | 138 [32m+++++++++[m
 .../src/seller/pages/Auth/SellerForgotPassword.tsx | 102 [32m+++++++[m
 .../src/seller/pages/Auth/SellerResetPassword.tsx  | 128 [32m+++++++++[m
 .../src/seller/pages/Orders/OrderTable.tsx         |   1 [32m+[m
 28 files changed, 1849 insertions(+), 468 deletions(-)
