import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { filterDirectoryUsers, getDirectoryUserLabel } from "../mockData";

export default function UserMultiSelect({
  users,
  selected,
  onChange,
  label,
  placeholder = "Search users...",
}) {
  const [query, setQuery] = useState("");

  const filteredUsers = useMemo(
    () => filterDirectoryUsers(users, query),
    [query, users],
  );

  function toggleUser(email) {
    if (selected.includes(email)) {
      onChange(selected.filter((v) => v !== email));
    } else {
      onChange([...selected, email]);
    }
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
          {label}
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {selected.length} selected
        </Typography>
      </Box>

      {/* Search Input */}
      <TextField
        size="small"
        fullWidth
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        aria-label="Search users"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: "text.secondary" }} />
              </InputAdornment>
            ),
            endAdornment: query ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setQuery("")}
                  edge="end"
                  aria-label="clear search"
                >
                  <ClearIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </InputAdornment>
            ) : null,
          },
        }}
        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
      />

      {/* Selected chips */}
      {selected.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
          {selected.map((value) => (
            <Chip
              key={value}
              label={getDirectoryUserLabel(value, users)}
              onDelete={() => toggleUser(value)}
              size="small"
              sx={{
                bgcolor: "rgba(0,119,182,0.08)",
                color: "primary.dark",
                border: "1px solid rgba(0,119,182,0.2)",
                fontWeight: 600,
              }}
            />
          ))}
        </Box>
      )}

      {/* User list */}
      <Box
        sx={{
          maxHeight: 256,
          overflowY: "auto",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "12px",
          bgcolor: "background.paper",
          boxShadow: 1,
        }}
        className="thin-scroll"
      >
        {filteredUsers.length === 0 ? (
          <Box sx={{ px: 2, py: 4, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No users match your search.
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {filteredUsers.map((user) => {
              const isSelected = selected.includes(user.email);
              const initials = user.name
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase() ?? "")
                .join("");

              return (
                <ListItemButton
                  key={user.id}
                  onClick={() => toggleUser(user.email)}
                  sx={{
                    gap: 1.5,
                    borderRadius: "8px",
                    mx: 0.5,
                    my: 0.25,
                    bgcolor: isSelected ? "rgba(0,119,182,0.06)" : "transparent",
                    outline: isSelected ? "1px solid rgba(0,119,182,0.2)" : "none",
                    "&:hover": { bgcolor: isSelected ? "rgba(0,119,182,0.10)" : "action.hover" },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: "#0B2D4D",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {initials}
                  </Avatar>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "text.primary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      >
                        {user.name}
                      </Typography>
                      <Chip
                        label={isSelected ? "Added" : user.role}
                        size="small"
                        sx={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", flexShrink: 0 }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ color: "text.secondary", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user.email}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {user.department} · {user.title}
                    </Typography>
                  </Box>
                </ListItemButton>
              );
            })}
          </List>
        )}
      </Box>
    </Box>
  );
}
