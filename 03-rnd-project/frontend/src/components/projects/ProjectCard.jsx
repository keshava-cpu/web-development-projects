import {
  Card,
  CardContent,
  Stack,
  Typography,
  Box,
  Link,
  IconButton,
} from "@mui/material";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import StatusTag from "./StatusTag";
import { colors } from "../../theme/colors";
import { formatCurrency } from "../../utils/projectHelpers";

const ProjectCard = ({ project, onEdit }) => (
  <Card
    sx={{
      bgcolor: colors.white,
      border: `1px solid ${colors.lightSteel}`,
      height: "100%",
      position: "relative",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 8px 24px rgba(11, 45, 77, 0.08)",
      },
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Stack spacing={2}>
        {/* Layout rules safely applied inside the sx prop */}
        <Stack
          direction="row"
          gap={2}
          sx={{
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Stack spacing={0.5} sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              sx={{
                color: colors.midnightBlue,
                fontWeight: 600,
                lineHeight: 1.3,
              }}
            >
              {project.title || "Untitled Project"}
            </Typography>

            <Typography
              variant="body2"
              sx={{ color: colors.coolGray, fontStyle: "italic" }}
            >
              Funded by {project.agency}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <StatusTag status={project.status} />
            {/* Display edit button if onEdit function is supplied (admin condition met) */}
            {onEdit && (
              <IconButton
                size="small"
                onClick={() => onEdit(project)}
                sx={{
                  color: colors.coolGray,
                  "&:hover": { color: colors.midnightBlue },
                }}
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <AccountBalanceOutlinedIcon
            sx={{ color: colors.scientificTeal, fontSize: 20 }}
          />
          <Typography
            variant="body1"
            sx={{ fontWeight: 600, color: colors.graphite }}
          >
            {formatCurrency(project.amount)}
          </Typography>
        </Stack>

        <Stack spacing={1}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <PersonOutlineOutlinedIcon
              sx={{ color: colors.coolGray, fontSize: 18 }}
            />
            <Typography variant="body2">
              <Box component="span" sx={{ color: colors.coolGray }}>
                PI:{" "}
              </Box>
              {project.pi}
            </Typography>
          </Stack>

          {project.co_pi && (
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <GroupsOutlinedIcon
                sx={{ color: colors.coolGray, fontSize: 18 }}
              />
              <Typography variant="body2">
                <Box component="span" sx={{ color: colors.coolGray }}>
                  Co-PI:{" "}
                </Box>
                {project.co_pi}
              </Typography>
            </Stack>
          )}
        </Stack>

        {project.utilization_report_path && (
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <PictureAsPdfOutlinedIcon
              sx={{ color: colors.professionalRed, fontSize: 18 }}
            />
            <Link
              href={project.utilization_report_path}
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              variant="body2"
            >
              Utilization Report
            </Link>
          </Stack>
        )}
      </Stack>
    </CardContent>
  </Card>
);

export default ProjectCard;
