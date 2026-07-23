import { Box, Button } from "@mui/material";
import HomeCategoryTable from "./HomeCategoryTable";
import PreviewIcon from "@mui/icons-material/Preview";

function ElectronicsTable() {
  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" mb={1}>
        <Button
          size="small"
          startIcon={<PreviewIcon />}
          onClick={() => window.open("/", "_blank")}
        >
          Preview Homepage
        </Button>
      </Box>
      <HomeCategoryTable section="ELECTRIC_CATEGORIES" />
    </Box>
  );
}

export default ElectronicsTable;
