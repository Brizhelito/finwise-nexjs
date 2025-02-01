import { styled } from "@mui/material/styles";
import { Container } from "@mui/material";

export const StyledContainer = styled(Container)(({ theme }) => ({
  minHeight: "100vh",
  padding: theme.spacing(4),
  background: theme.palette.background.default,
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

export const GoalsGrid = styled("div")(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  gap: theme.spacing(3),
  margin: theme.spacing(4, 0),
}));
