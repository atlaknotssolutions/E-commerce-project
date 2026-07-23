import React from 'react';
import { Card, CardContent } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

const EmptyDashboard: React.FC = () => {
    return (
        <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-16">
                <InboxIcon sx={{ fontSize: 64, color: '#CBD5E1' }} aria-hidden="true" />
                <h3 className="text-lg font-semibold text-gray-500 mt-4">
                    No Dashboard Data Available
                </h3>
                <p className="text-sm text-gray-400 mt-2 text-center max-w-md">
                    The admin dashboard will show platform analytics, user metrics,
                    order insights, and seller overview once the backend endpoints are configured.
                </p>
            </CardContent>
        </Card>
    );
};

export default React.memo(EmptyDashboard);
