import { Review } from '../types/reviewTypes';

export interface RatingBucket {
    label: string;
    stars: number;
    count: number;
    percentage: number;
}

export interface ReviewStatistics {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: RatingBucket[];
    fiveStarCount: number;
    fourStarCount: number;
    threeStarCount: number;
    twoStarCount: number;
    oneStarCount: number;
}

const RATING_BUCKETS: { label: string; stars: number }[] = [
    { label: 'Excellent', stars: 5 },
    { label: 'Very Good', stars: 4 },
    { label: 'Good', stars: 3 },
    { label: 'Average', stars: 2 },
    { label: 'Poor', stars: 1 },
];

const countByRating = (reviews: Review[], stars: number): number =>
    reviews.filter((r) => Math.round(r.rating) === stars).length;

export const computeReviewStatistics = (reviews: Review[]): ReviewStatistics => {
    const totalReviews = reviews.length;

    if (totalReviews === 0) {
        return {
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: RATING_BUCKETS.map((b) => ({
                label: b.label,
                stars: b.stars,
                count: 0,
                percentage: 0,
            })),
            fiveStarCount: 0,
            fourStarCount: 0,
            threeStarCount: 0,
            twoStarCount: 0,
            oneStarCount: 0,
        };
    }

    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = Math.round((sum / totalReviews) * 10) / 10;

    const fiveStarCount = countByRating(reviews, 5);
    const fourStarCount = countByRating(reviews, 4);
    const threeStarCount = countByRating(reviews, 3);
    const twoStarCount = countByRating(reviews, 2);
    const oneStarCount = countByRating(reviews, 1);

    const counts: Record<number, number> = {
        5: fiveStarCount,
        4: fourStarCount,
        3: threeStarCount,
        2: twoStarCount,
        1: oneStarCount,
    };

    const ratingDistribution: RatingBucket[] = RATING_BUCKETS.map((b) => ({
        label: b.label,
        stars: b.stars,
        count: counts[b.stars],
        percentage: Math.round((counts[b.stars] / totalReviews) * 100),
    }));

    return {
        averageRating,
        totalReviews,
        ratingDistribution,
        fiveStarCount,
        fourStarCount,
        threeStarCount,
        twoStarCount,
        oneStarCount,
    };
};
