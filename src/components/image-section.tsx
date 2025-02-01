"use client";

import { Grid, useTheme } from "@mui/material";
import { StyledImage, SectionTitle } from "./client-components";

type ImageSectionProps = {
  reverse?: boolean;
  image: {
    src: string;
    alt: string;
  };
  title: string;
};

export const ImageSection = ({
  reverse = false,
  image,
  title,
}: ImageSectionProps) => {
  const theme = useTheme();

  return (
    <Grid
      container
      spacing={8}
      alignItems="center"
      direction={reverse ? "row-reverse" : "row"}
      sx={{
        [theme.breakpoints.down("md")]: {
          flexDirection: "column-reverse",
        },
      }}
    >
      <Grid item xs={12} md={6}>
        <StyledImage
          src={image.src}
          alt={image.alt}
          width={600}
          height={400}
          priority
          placeholder="blur"
          blurDataURL="/images/placeholder.webp"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <SectionTitle variant="h4" color="primary">
          {title}
        </SectionTitle>
      </Grid>
    </Grid>
  );
};
