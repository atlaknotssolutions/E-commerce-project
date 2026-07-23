import React, { useState } from "react";
import { Box, Button, Modal } from "@mui/material";

import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import
    {
        deleteUserAddress,
        setDefaultUserAddress,
    } from "../../../Redux Toolkit/Customer/UserSlice";

import { Address } from "../../../types/userTypes";
import AddressForm from "../Checkout/AddresssForm";
import UserAddressCard from "./UserAddressCard";

const Addresses = () =>
{
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((store) => store);

    const [open, setOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    const handleEdit = (address: Address) =>
    {
        setEditingAddress(address);
        setOpen(true);
    };

    const handleDelete = (addressId: string) =>
    {
        dispatch(
            deleteUserAddress({
                jwt: localStorage.getItem("jwt") || "",
                addressId,
            })
        );
    };

    const handleSetDefault = (addressId: string) =>
    {
        dispatch(
            setDefaultUserAddress({
                jwt: localStorage.getItem("jwt") || "",
                addressId,
            })
        );
    };

    const handleClose = () =>
    {
        setOpen(false);
        setEditingAddress(null);
    };

    return (
        <>
            <div className="flex justify-end mb-4">
                <Button
                    variant="contained"
                    onClick={() =>
                    {
                        setEditingAddress(null);
                        setOpen(true);
                    }}
                >
                    Add Address
                </Button>
            </div>

            <div className="space-y-3">
                {user.user?.addresses?.map((item) => (
                    <UserAddressCard
                        key={item.id}
                        item={item}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onSetDefault={handleSetDefault}
                    />
                ))}
            </div>

            <Modal open={open} onClose={handleClose}>
                <Box
                    sx={{
                        width: 650,
                        bgcolor: "background.paper",
                        borderRadius: 2,
                        p: 3,
                        mx: "auto",
                        mt: 8,
                    }}
                >
                    <AddressForm
                        handleClose={handleClose}
                        paymentGateway=""
                        editingAddress={editingAddress}
                    />
                </Box>
            </Modal>
        </>
    );
};

export default Addresses;