import React from "react";
import { Address } from "../../../types/userTypes";

interface UserAddressCardProps
{
  item: Address;
  onEdit: (address: Address) => void;
  onDelete: (addressId: string) => void;
  onSetDefault: (addressId: string) => void;
}

const UserAddressCard: React.FC<UserAddressCardProps> = ({
  item,
  onEdit,
  onDelete,
  onSetDefault,
}) =>
{
  return (
    <div className="border rounded-lg p-5 shadow-sm bg-white">
      <h2 className="font-semibold text-lg">{item.name}</h2>

      {item.isDefault && (
        <span className="inline-block mt-2 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
          Default Address
        </span>
      )}

      <p className="mt-2 text-gray-700">
        {item.address}, {item.locality}, {item.city}, {item.state} -{" "}
        {item.pinCode}
      </p>

      <p className="mt-2">
        <strong>Mobile:</strong> {item.mobile}
      </p>


      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onEdit(item)}
          className="rounded-md border border-blue-500 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
        >
          Edit
        </button>

        <button
          type="button"
          onClick={() => onDelete(item.id!)}
          className="rounded-md border border-red-500 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          Delete
        </button>

        {!item.isDefault && (
          <button
            type="button"
            onClick={() => onSetDefault(item.id!)}
            className="rounded-md border border-green-500 px-4 py-2 text-sm font-medium text-green-600 transition hover:bg-green-50"
          >
            Set Default
          </button>
        )}
      </div>
    </div>
  );
};

export default UserAddressCard;


// import React from 'react'
// import { Address } from '../../../types/userTypes'

// const UserAddressCard = ({item}:{item: Address}) => {
//   return (
//     <div className='p-5 border rounded-md '>
   

//     <div className='space-y-3'>
//         <h1 className='font-semibold'>{item.name}</h1>
//         <p className='w-[320px]'>
//             {item.address},
//             {item.locality},
//             {item.city},
//             {item.state} - {item.pinCode}</p>
//         <p><strong>Mobile : </strong> {item.mobile}</p>
//     </div>
// </div>
//   )
// }

// export default UserAddressCard