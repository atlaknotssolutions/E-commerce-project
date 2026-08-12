/**
 * Pure function-based factory representing the Optional Route Authentication
 * Security Middleware.
 *
 * Accepts EITHER a valid Bearer JWT (populating `req.user`) OR no credentials
 * at all (leaving `req.user` undefined so downstream handlers can fall back to
 * a provider-issued capability such as a Stripe checkout session id).
 *
 * A token that IS provided but fails verification is still rejected - optional
 * auth never turns an invalid token into a silent success.
 */
export const createOptionalAuthenticateMiddleware = ({ verifyToken, jwtAccessSecret, createApiError }) =>
{
    return (req, res, next) =>
    {
        const authHeader = req.headers.authorization;

        // No credentials provided: allow through unauthenticated.
        // The route handler/service decides whether the alternative
        // capability (e.g. Stripe session ownership) is acceptable.
        if (!authHeader || !authHeader.startsWith('Bearer '))
        {
            return next();
        }

        const token = authHeader.split(' ')[1];

        try
        {
            const decodedPayload = verifyToken({ token, secret: jwtAccessSecret });
            req.user = decodedPayload;
            next();
        } catch (error)
        {
            next(error);
        }
    };
};
