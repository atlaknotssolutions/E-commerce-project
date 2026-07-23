import { Box, Grid, LinearProgress, Rating } from '@mui/material'
import React from 'react'
import { ReviewStatistics } from '../../../util/reviewStatistics';

interface RatingCardProps {
    stats: ReviewStatistics;
}

const RatingCard = ({ stats }: RatingCardProps) => {
    const { averageRating, totalReviews, ratingDistribution } = stats;

    return (
        <div className="border p-5 rounded-md">
            <div className="flex items-center space-x-3 pb-10">
                <Rating
                    name="read-only"
                    value={averageRating}
                    precision={0.5}
                    readOnly
                />
                <p className="opacity-60">{totalReviews} Ratings</p>
            </div>
            <Box>
                {ratingDistribution.map((bucket) => (
                    <Grid
                        key={bucket.stars}
                        container
                        justifyContent="center"
                        alignItems="center"
                        gap={2}
                    >
                        <Grid xs={2}>
                            <p className="p-0">{bucket.label}</p>
                        </Grid>
                        <Grid xs={7}>
                            <LinearProgress
                                sx={{ bgcolor: "#d0d0d0", borderRadius: 4, height: 7 }}
                                variant="determinate"
                                value={bucket.percentage}
                                color={bucket.stars >= 4 ? "success" : bucket.stars === 3 ? "info" : "error"}
                            />
                        </Grid>
                        <Grid xs={2}>
                            <p className="opacity-50 p-2">{bucket.count}</p>
                        </Grid>
                    </Grid>
                ))}
            </Box>
        </div>
    )
}

export default RatingCard
