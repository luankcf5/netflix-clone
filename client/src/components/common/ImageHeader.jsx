import { Box, useTheme } from "@mui/material";
import uiConfigs from "../../configs/ui.configs";

const ImageHeader = ({ imgPath }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        zIndex: "-1",
        position: "relative",
        paddingTop: {
          xs: "60%",
          sm: "40%",
          md: "35%",
        },
        backgroundPosition: "top",
        backgroundSize: "cover",
        backgroundImage: `urL(${imgPath})`,
        backgroundAttachment: "fixed",
        "&::before": {
          content: "''",
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          ...uiConfigs.style.gradientBgImage[theme.palette.mode],
        },
      }}
    />
  );
};

export default ImageHeader;
