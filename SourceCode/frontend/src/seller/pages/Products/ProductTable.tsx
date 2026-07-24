// import * as React from 'react';
// import Table from '@mui/material/Table';
// import TableBody from '@mui/material/TableBody';
// import TableCell, { tableCellClasses } from '@mui/material/TableCell';
// import TableContainer from '@mui/material/TableContainer';
// import TableHead from '@mui/material/TableHead';
// import TableRow from '@mui/material/TableRow';
// import Paper from '@mui/material/Paper';
// import { Button, IconButton, styled, TableFooter, TablePagination } from '@mui/material';
// import TablePaginationActions from '@mui/material/TablePagination/TablePaginationActions';
// import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
// import { fetchSellerProducts } from '../../../Redux Toolkit/Seller/sellerProductSlice';
// import EditIcon from '@mui/icons-material/Edit';

// function createData(
//   name: string,
//   calories: number,
//   fat: number,
//   carbs: number,
//   protein: number,
// ) {
//   return { name, calories, fat, carbs, protein };
// }




// const StyledTableCell = styled(TableCell)(({ theme }) => ({
//   [`&.${tableCellClasses.head}`]: {
//     backgroundColor: theme.palette.common.black,
//     color: theme.palette.common.white,
//   },
//   [`&.${tableCellClasses.body}`]: {
//     fontSize: 14,
//   },
// }));

// const StyledTableRow = styled(TableRow)(({ theme }) => ({
//   '&:nth-of-type(odd)': {
//     backgroundColor: theme.palette.action.hover,
//   },
//   // hide last border
//   '&:last-child td, &:last-child th': {
//     border: 0,
//   },
// }));

// export default function ProductTable() {
//   const [page, setPage] = React.useState(0);
//   const [rowsPerPage, setRowsPerPage] = React.useState(5);
//   const { sellerProduct } = useAppSelector(store => store);
//   const dispatch = useAppDispatch();




//   React.useEffect(() => {
//     dispatch(fetchSellerProducts(localStorage.getItem("jwt")))
//   }, [])


//   return (
//     <>
//       <h1 className='pb-5 font-bold text-xl'>Products</h1>

//       <TableContainer component={Paper}>
//         <Table sx={{ minWidth: 700 }} aria-label="customized table">
//           <TableHead>
//             <TableRow>
//               <StyledTableCell>Images</StyledTableCell>
//               <StyledTableCell align="right">Title</StyledTableCell>
//               <StyledTableCell align="right">MRP</StyledTableCell>
//               <StyledTableCell align="right">Selling Price</StyledTableCell>
//               <StyledTableCell align="right">Color</StyledTableCell>
//               <StyledTableCell align="right">Update Stock</StyledTableCell>
//               <StyledTableCell align="right">Update</StyledTableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {sellerProduct.products.map((item) => (
//               <StyledTableRow key={item.id}>
//                 <StyledTableCell component="th" scope="row">
//                   <div className='flex gap-1 flex-wrap'>
//                                       {item.images.map((image) => <img className='w-20 rounded-md' src={image} alt=""/>) }

//                   </div>
//                 </StyledTableCell>
//                  <StyledTableCell align="right">{item.title}</StyledTableCell>
//                 <StyledTableCell align="right"> ₹{item.mrpPrice}.0</StyledTableCell>
//             <StyledTableCell align="right"> ₹{item.sellingPrice}.0</StyledTableCell>
//                    <StyledTableCell align="right">{item.color}</StyledTableCell>
//                    <StyledTableCell align="right"> <Button size='small'>in_stock</Button></StyledTableCell>
//                    <StyledTableCell align="right">
//                     <IconButton color='primary' className='bg-primary-color'>
//                       <EditIcon/>
//                     </IconButton>
//                    </StyledTableCell>
//               </StyledTableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>
//     </>

//   );
// }




import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Button, IconButton } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import { fetchSellerProducts } from '../../../Redux Toolkit/Seller/sellerProductSlice';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import { StyledTableCell, StyledTableRow } from '../../../components/shared/Table';

export default function ProductTable() {
  const { sellerProduct } = useAppSelector(store => store);
  const dispatch = useAppDispatch();
  const navigate = useNavigate(); // 2. Navigate Hook Initialize Kiya

  React.useEffect(() => {
    if (sellerProduct.productsLoaded) return;
    dispatch(fetchSellerProducts(localStorage.getItem("jwt")));
  }, [dispatch, sellerProduct.productsLoaded]);

  return (
    <>
      <h1 className='pb-5 font-bold text-xl'>Products Catalog</h1>

      <TableContainer component={Paper} sx={{ maxHeight: "calc(100vh - 290px)" }}>
        <Table stickyHeader sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Image</StyledTableCell>
              <StyledTableCell>Product Details</StyledTableCell>
              <StyledTableCell align="right">MRP</StyledTableCell>
              <StyledTableCell align="right">Selling Price</StyledTableCell>
              <StyledTableCell align="right">Discount</StyledTableCell>
              <StyledTableCell align="center">Stock Status</StyledTableCell>
              <StyledTableCell align="right">Action</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sellerProduct.products?.map((item: any) => (
              <StyledTableRow key={item.id || item._id}>
                {/* Product Image */}
                <StyledTableCell component="th" scope="row">
                  <img 
                    className='w-16 h-16 object-cover rounded-md border bg-gray-50' 
                    src={item.images?.find((img: any) => img.isPrimary)?.url ?? item.images?.[0]?.url ?? "/logo192.png"} 
                    alt={item.title}
                  />
                </StyledTableCell>

                {/* Rich Product Details (Title, Color, Size, Category) */}
                <StyledTableCell align="left">
                  <div className='flex flex-col text-xs space-y-0.5'>
                    <h2 className='font-bold text-sm text-gray-900'>{item.title}</h2>
                    <p className='text-gray-500'>Category: <span className='text-gray-700 font-medium'>{item.category?.name || 'N/A'}</span></p>
                    <div className='flex gap-2 mt-1'>
                      {item.variants && item.variants.length > 0 ? (
                        <>
                          <span className='bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[10px] border border-blue-100'>
                            {item.variants.length} Variant{item.variants.length !== 1 ? 's' : ''}
                          </span>
                          <span className='bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[10px] border border-emerald-200'>
                            Stock: {item.variants.reduce((sum: number, v: any) => sum + (v.quantity || 0), 0)}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className='bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-[10px] border'>Color: {item.color}</span>
                          <span className='bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[10px] border border-blue-100'>Size: {item.sizes || 'FREE'}</span>
                        </>
                      )}
                    </div>
                  </div>
                </StyledTableCell>

                {/* Pricing Fields */}
                <StyledTableCell align="right" className='text-gray-400 line-through'>
                  {item.variants && item.variants.length > 1
                    ? `₹${Math.min(...item.variants.map((v: any) => v.mrpPrice || 0))}`
                    : `₹${item.mrpPrice}`}
                </StyledTableCell>
                <StyledTableCell align="right" className='font-semibold text-gray-900'>
                  {item.variants && item.variants.length > 1
                    ? `₹${Math.min(...item.variants.map((v: any) => v.price || 0))}`
                    : `₹${item.sellingPrice}`}
                </StyledTableCell>
                
                {/* Dynamic Discount Badge */}
                <StyledTableCell align="right">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${item.discountPercent > 0 ? 'bg-orange-50 text-orange-600 border border-orange-200' : 'text-gray-400'}`}>
                    {item.discountPercent}% OFF
                  </span>
                </StyledTableCell>

                {/* Conditional Dynamic Stock Alert */}
                <StyledTableCell align="center">
                  <div className='flex flex-col items-center justify-center gap-1'>
                    {(() => {
                      const totalStock = item.variants && item.variants.length > 0
                        ? item.variants.reduce((sum: number, v: any) => sum + (v.quantity || 0), 0)
                        : item.quantity || 0;
                      return (
                        <>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            totalStock > 0 
                              ? totalStock <= 5 
                                ? 'bg-amber-50 border-amber-200 text-amber-700'
                                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : 'bg-rose-50 border-rose-200 text-rose-700'
                          }`}>
                            {totalStock > 0 ? (totalStock <= 5 ? 'LOW STOCK' : 'IN STOCK') : 'OUT OF STOCK'}
                          </span>
                          <span className='text-[11px] font-bold text-gray-500'>{totalStock} units left</span>
                        </>
                      );
                    })()}
                  </div>
                </StyledTableCell>

                {/* Working Action Button */}
                <StyledTableCell align="right">
                  <IconButton 
                    color='primary' 
                    className='bg-primary-color hover:bg-opacity-90'
                    onClick={() => navigate(`/seller/update-product/${item.id || item._id}`)} // 3. Redirect to Update Page
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}