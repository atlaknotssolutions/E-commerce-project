/**
 * Pure function-based factory representing the Transaction Persistence database interface.
 * Decouples database collections lookup pipelines using Dependency Injection.
 */
export const createTransactionRepository = ({ Transaction }) =>
{

  /**
   * Creates a new transaction record.
   */
  const createTransaction = async (transactionData, options = {}) =>
  {
    const [transaction] = await Transaction.create([transactionData], options);
    return transaction?.toObject() ?? null;
  };

  /**
   * Returns all transactions for a seller.
   */
  const findBySellerId = async (sellerId, options = {}) =>
  {
    return Transaction.find(
      { seller: sellerId },
      null,
      options
    )
      .populate("customer", "fullName email mobile")
      .populate("order", "orderId totalSellingPrice orderStatus")
      .sort({ createdAt: -1 })
      .lean();
  };

  /**
   * Returns all platform transactions.
   */
  const findAllTransactions = async (options = {}) =>
  {
    return Transaction.find({}, null, options)
      .populate("customer", "fullName email mobile")
      .populate("seller", "sellerName email mobile businessDetails")
      .populate("order", "orderId totalSellingPrice orderStatus")
      .sort({ createdAt: -1 })
      .lean();
  };

  /**
   * Finds transaction by Order Id.
   */
  const findByOrderId = async (orderId, options = {}) =>
  {
    return Transaction.findOne(
      { order: orderId },
      null,
      options
    ).lean();
  };

  return Object.freeze({
    createTransaction,
    findBySellerId,
    findAllTransactions,
    findByOrderId,
  });
};



// /**
//  * Pure function-based factory representing the Transaction Persistence database interface.
//  * Decouples database collections lookup pipelines using Dependency Injection.
//  */
// export const createTransactionRepository = ({ Transaction }) =>
// {

//   /**
//    * Commits a new transaction ledger record directly into database.
//    * Supports array-wrap configurations to run smoothly inside transactions.
//    */
//   const createTransaction = async (transactionData, options = {}) =>
//   {
//     const [newTransaction] = await Transaction.create([transactionData], options);
//     return newTransaction ? newTransaction.toObject() : null;
//   };

//   /**
//    * Pulls seller-specific transaction statements chronologically descending (newest first).
//    * Populates associated customer profiles details securely.
//    */
//   const findBySellerId = async (sellerId, options = {}) =>
//   {
//     return Transaction.find({ seller: sellerId }, null, options)
//       .sort({ date: -1 })
//       .populate('customer', 'fullName email mobile') // Populates customer details
//       .populate('order', 'orderId totalSellingPrice orderStatus') // Populates basic order statistics
//       .lean(); // Returns plain lightweight JS objects for fast memory rendering
//   };

//   /**
//    * Pulls complete platform transactions ledger (for admin audits), sorted newest first.
//    */
//   const findAllTransactions = async (options = {}) =>
//   {
//     return Transaction.find({}, null, options)
//       .sort({ date: -1 })
//       .populate('customer', 'fullName email mobile')
//       .populate('seller', 'sellerName email mobile businessDetails')
//       .populate('order', 'orderId totalSellingPrice orderStatus')
//       .lean();
//   };

//   const findByOrderId = async (orderId, options = {}) =>
//   {
//     return Transaction.findOne({ order: orderId }, null, options);
//   };

//   return Object.freeze({
//     createTransaction,
//     findByOrderId,
//     findBySellerId,
//     findAllTransactions,
//   });
// };