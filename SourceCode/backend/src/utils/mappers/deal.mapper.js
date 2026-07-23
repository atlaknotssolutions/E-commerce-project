import { mapHomeCategory } from './homeCategory.mapper.js';


/**
 * Converts Deal document into frontend Deal format.
 */
export const mapDeal = (deal) =>
{
    if (!deal)
    {
        return null;
    }


    return {
        discount: deal.discount,

        category: mapHomeCategory(
            deal.category
        ),
    };
};


export const mapDeals = (deals = []) =>
{
    return deals.map(mapDeal);
};