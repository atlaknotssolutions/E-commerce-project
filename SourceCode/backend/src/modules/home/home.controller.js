/**
 * Pure function-based controller representing public Homepage APIs.
 * Keeps HTTP handling separate from homepage business composition.
 */
export const createHomeController = ({
    homeService,
}) =>
{
    /**
     * GET /home-page
     *
     * Public endpoint used by customer storefront.
     */
    const getHomePageData = async (req, res) =>
    {
        const homepageData = await homeService.getHomePageData();

        return res.status(200).json(homepageData);
    };

    return Object.freeze({
        getHomePageData,
    });
};