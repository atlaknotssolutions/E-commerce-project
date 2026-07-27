import { Button, Card, Divider, Chip, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import TransactionTable from './TransactionTable';
import Payouts from './PayoutsTable';
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import { fetchSellerReport } from "../../../Redux Toolkit/Seller/sellerSlice";
import { fetchPayoutBalance } from '../../../Redux Toolkit/Seller/payoutSlice';

const tab = [
    { name: "Transaction" },
    { name: "Payouts" }
]

const Payment = () => {
    const [activeTab, setActiveTab] = useState(tab[0].name);
    const { sellers, payouts } = useAppSelector((store) => store);
    const dispatch = useAppDispatch();

    const handleActiveTab = (item: any) => {
        setActiveTab(item.name);
    }

    useEffect(() => {
        const jwt = localStorage.getItem("jwt");
        if (!jwt) return;
        if (!sellers.reportLoaded) {
            dispatch(fetchSellerReport(jwt));
        }
        dispatch(fetchPayoutBalance(jwt));
    }, [dispatch, sellers.reportLoaded]);

    return (
        <div>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
                <Card className='col-span-1 p-5 rounded-md space-y-4'>
                    <h1 className='text-gray-600 font-medium'>Total Earning</h1>
                    <h1 className='font-bold text-xl pb-1'>₹{sellers.report?.netEarnings?.toLocaleString() ?? 0}</h1>
                    <Divider />
                    <p className='text-gray-600 font-medium pt-1'>
                        Available Balance : <strong>₹{payouts.balance?.availableBalance?.toLocaleString() ?? 0}</strong>
                    </p>
                </Card>
                <Card className='col-span-1 p-5 rounded-md space-y-4'>
                    <h1 className='text-gray-600 font-medium'>Pending Payouts</h1>
                    <h1 className='font-bold text-xl pb-1'>₹{payouts.balance?.lockedPayouts?.toLocaleString() ?? 0}</h1>
                    <Divider />
                    <p className='text-gray-600 font-medium pt-1'>
                        Active Commissions : <strong>₹{payouts.balance?.activeCommissions?.toLocaleString() ?? 0}</strong>
                    </p>
                </Card>
            </div>
            <div className='mt-20'>
                <div className='flex gap-4'>
                    {tab && tab.map((item) => (
                        <Button
                            key={item.name}
                            onClick={() => handleActiveTab(item)}
                            variant={activeTab === item.name ? "contained" : "outlined"}
                        >
                            {item.name}
                        </Button>
                    ))}
                </div>
                <div className='mt-5'>
                    {activeTab === "Transaction" ? <TransactionTable /> : <Payouts />}
                </div>
            </div>
        </div>
    )
}

export default Payment
