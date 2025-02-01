// components/StyledComponents.tsx
"use client";

import { styled } from "@mui/material/styles";
import { ListItem } from "@mui/material";

export const StyledListItem = styled(ListItem)(({ theme }) => ({
  alignItems: "flex-start",
  paddingLeft: 0,
  "& .MuiListItemText-primary": {
    fontWeight: 600,
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(1),
  },
  "& .MuiListItemText-secondary": {
    color: theme.palette.text.secondary,
    lineHeight: 1.6,
  },
}));
