/**
 * Pure function-based factory representing the Transaction Ledger HTTP Controllers.
 * Responsible only for HTTP request/response orchestration.
 */
export const createTransactionController = ({
    transactionService,
    transactionMapper,
}) =>
{

    /**
     * GET /api/transactions/seller
     */
    const getSellerTransactions = async (req, res) =>
    {

        const sellerId = req.user.id;

        const transactions =
            await transactionService.getSellerTransactions({ sellerId });

        return res.status(200).json({
            success: true,
            message: "Seller transactions fetched successfully.",
            data: transactionMapper.toTransactionDtoList(transactions),
        });
    };

    /**
     * GET /api/transactions
     */
    const getAllTransactions = async (req, res) =>
    {

        const transactions =
            await transactionService.getAllTransactions();

        return res.status(200).json({
            success: true,
            message: "Platform transactions fetched successfully.",
            data: transactionMapper.toTransactionDtoList(transactions),
        });
    };

    /**
     * POST /api/transactions
     */
    const createTransaction = async (req, res) =>
    {

        const { orderId } = req.body;

        const transaction =
            await transactionService.createForOrder({ orderId });

        return res.status(201).json({
            success: true,
            message: "Transaction created successfully.",
            data: transactionMapper.toTransactionDto(transaction),
        });
    };

    return Object.freeze({
        getSellerTransactions,
        getAllTransactions,
        createTransaction,
    });
};