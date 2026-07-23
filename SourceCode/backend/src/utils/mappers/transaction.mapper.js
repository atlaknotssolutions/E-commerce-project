/**
 * Maps Transaction document into frontend-friendly DTO.
 */
const toTransactionDto = (transaction) => ({
    id: transaction._id.toString(),

    customer: transaction.customer,

    seller: transaction.seller,

    order: transaction.order,

    date: transaction.date,

    createdAt: transaction.createdAt,

    updatedAt: transaction.updatedAt,
});

const toTransactionDtoList = (transactions = []) =>
    transactions.map(toTransactionDto);

export const transactionMapper = Object.freeze({
    toTransactionDto,
    toTransactionDtoList,
});