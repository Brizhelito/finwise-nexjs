"use client";

import { Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import Image from "next/image";

export const SectionContainer = styled("section")(({ theme }) => ({
  padding: theme.spacing(8, 0),
  backgroundColor: theme.palette.background.default,
}));

export const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  fontWeight: 700,
  [theme.breakpoints.down("md")]: {
    textAlign: "center",
  },
}));

export const BodyText = styled(Typography)(({ theme }) => ({
  lineHeight: 1.6,
  color: theme.palette.text.secondary,
}));

export const StyledImage = styled(Image)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[4],
}));
