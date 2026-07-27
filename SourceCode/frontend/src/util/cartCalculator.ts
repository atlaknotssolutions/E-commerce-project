import { CartItem } from "../types/cartTypes"

export const sumCartItemSellingPrice=(items:CartItem[]):number=>{
    return items.reduce((acc, item)=>{return (item?.sellingPrice * item?.quantity)+acc},0)
}

export const sumCartItemMrpPrice=(items:CartItem[]):number=>{
    return items.reduce((acc, item)=>{return (item?.mrpPrice * item?.quantity)+acc},0)
}