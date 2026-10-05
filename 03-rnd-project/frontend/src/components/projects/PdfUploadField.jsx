import { useCallback, useState } from "react";
import { Box, Typography, Stack } from "@mui/material";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import { colors } from "../../theme/colors";

const PdfUploadField = ({ value, onChange, error }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(
    (files) => {
      const file = files?.[0];
      if (!file) return;

      if (file.type !== "application/pdf") {
        onChange(null, "Only PDF utilization reports are allowed.");
        return;
      }

      onChange(file, null);
    },
    [onChange],
  );

  const onDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  return (
    <Box>
      <Box
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        sx={{
          border: `2px dashed ${error ? colors.professionalRed : isDragging ? colors.innovationCyan : colors.lightSteel}`,
          borderRadius: 2,
          bgcolor: isDragging ? "rgba(0, 166, 200, 0.06)" : colors.softWhite,
          p: 3,
          textAlign: "center",
          cursor: "pointer",
          transition: "border-color 0.2s ease, background-color 0.2s ease",
        }}
        onClick={() =>
          document.getElementById("utilization-report-input")?.click()
        }
      >
        <input
          id="utilization-report-input"
          type="file"
          accept="application/pdf"
          hidden
          onChange={(event) => handleFiles(event.target.files)}
        />

        <Stack spacing={1} alignItems="center">
          <CloudUploadOutlinedIcon
            sx={{ color: colors.innovationCyan, fontSize: 36 }}
          />
          <Typography
            variant="subtitle1"
            sx={{ color: colors.midnightBlue, fontWeight: 600 }}
          >
            Upload Utilization Report (PDF)
          </Typography>
          <Typography variant="body2">
            Drag and drop your PDF here, or click to browse files.
          </Typography>

          {value && (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mt: 1 }}
            >
              <PictureAsPdfOutlinedIcon
                sx={{ color: colors.professionalRed }}
              />
              <Typography
                variant="body2"
                sx={{ color: colors.graphite, fontWeight: 500 }}
              >
                {value.name}
              </Typography>
            </Stack>
          )}
        </Stack>
      </Box>

      {error && (
        <Typography
          variant="caption"
          sx={{ color: colors.professionalRed, mt: 1, display: "block" }}
        >
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default PdfUploadField;
