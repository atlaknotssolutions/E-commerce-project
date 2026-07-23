import { Order } from "./orderTypes";
import { Seller } from "./sellerTypes";
import { User } from "./userTypes";

export interface Transaction {
  id: string;
  customer: User;
  order: Order;
  seller: Seller;
  date: string;
}
