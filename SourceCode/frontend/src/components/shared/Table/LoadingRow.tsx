import { CircularProgress } from '@mui/material';
import StyledTableCell from './StyledTableCell';
import StyledTableRow from './StyledTableRow';

interface LoadingRowProps {
    colSpan: number;
}

const LoadingRow = ({ colSpan }: LoadingRowProps) => {
    return (
        <StyledTableRow>
            <StyledTableCell colSpan={colSpan} align="center" sx={{ py: 6 }}>
                <CircularProgress />
            </StyledTableCell>
        </StyledTableRow>
    );
};

export default LoadingRow;
