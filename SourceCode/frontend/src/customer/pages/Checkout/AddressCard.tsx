import { Radio } from '@mui/material'
import React from 'react'
import { Address } from '../../../types/userTypes';

interface AddressCardProps
{
    value: number;
    selectedValue: number;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    item: Address
}
const AddressCard: React.FC<AddressCardProps> = ({ value, selectedValue, handleChange, item }) =>
{


    return (
        <div className='p-5 border rounded-md flex '>
            <div>
                <Radio
                    checked={value === selectedValue}
                    onChange={handleChange}
                    value={value}
                    name="radio-buttons"
                    inputProps={{ 'aria-label': 'B' }}
                />
            </div>

            <div className='space-y-3 pt-3'>
                <div className="flex items-center gap-2">
                    <h1 className="font-semibold">{item.name}</h1>

                    {item.isDefault && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            Default
                        </span>
                    )}
                </div>
                <p className='w-[320px]'>
                    {item.address},
                    {item.locality},
                    {item.city},
                    {item.state} - {item.pinCode}</p>
                <p><strong>Mobile : </strong> {item.mobile}</p>
            </div>
        </div>
    )
}

export default AddressCard