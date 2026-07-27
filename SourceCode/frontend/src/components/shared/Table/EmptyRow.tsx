import StyledTableCell from './StyledTableCell';
import StyledTableRow from './StyledTableRow';

interface EmptyRowProps {
    colSpan: number;
    message?: string;
}

const EmptyRow = ({ colSpan, message = "No records found." }: EmptyRowProps) => {
    return (
        <StyledTableRow>
            <StyledTableCell colSpan={colSpan} align="center" sx={{ py: 6 }}>
                {message}
            </StyledTableCell>
        </StyledTableRow>
    );
};

export default EmptyRow;
