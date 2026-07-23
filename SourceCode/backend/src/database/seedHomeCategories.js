import { homeCategories } from "../modules/home/homeCategories.seed.js";

export const seedHomeCategories = async ({
    homeCategoryRepository,
}) =>
{
    const exists = await homeCategoryRepository.exists();

    if (exists)
    {
        console.log("✔ Home categories already seeded");
        return;
    }

    await homeCategoryRepository.createMany(homeCategories);

    console.log("✔ Home categories seeded successfully");
};