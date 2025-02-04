import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { EmojiObjectsOutlined } from "@mui/icons-material";

const NoDataDisplay = ({
  message = "No hay datos",
  submessage = "Agrega información para comenzar",
  height = 200,
  iconSize = 48,
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: height,
        textAlign: "center",
        p: 2,
        color: theme.palette.text.secondary,
      }}
    >
      <EmojiObjectsOutlined
        sx={{
          fontSize: iconSize,
          color: theme.palette.grey[400],
          mb: 1.5,
        }}
      />

      <Typography
        variant="h6"
        sx={{
          fontWeight: 500,
          mb: 0.5,
          color: theme.palette.text.primary,
        }}
      >
        {message}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          maxWidth: 300,
          lineHeight: 1.4,
        }}
      >
        {submessage}
      </Typography>
    </Box>
  );
};

export default NoDataDisplay;
