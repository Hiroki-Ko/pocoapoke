// /pocoapoke/src/components/MasterSelect.tsx
import { Chip, Stack, Typography, Box } from "@mui/material";
import type { Master } from "../api/useMasterCodes";

type Props = {
  className: string; // "specialty" など
  label: string;
  masterCodes: Master;
  value: number | null;
  onChange: (id: number | null) => void;
};

export function MasterSelect({
  className,
  label,
  masterCodes,
  value,
  onChange,
}: Props) {
  const items = masterCodes?.[className] ?? [];

  return (
    <div>
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: "bold"  }}>
        {label}
      </Typography>
      <Box
        sx={{
            mb: 2,
            maxHeight: 140,          // ← 少し余裕を持たせる
            overflowY: "auto",
            borderRadius: 1,
            border: "1px solid #ddd",
            p: 1,
            bgcolor: "#ffffff",
            display: "flex",
            alignItems: "flex-start", // ← スクロールバーが上に寄らない
        }}
      >
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {items.map((m) => (
            <Chip
              key={m.id}
              label={m.label}
              color={value === m.id ? "primary" : "default"}
              variant={value === m.id ? "filled" : "outlined"}
              onClick={() => onChange(value === m.id ? null : m.id)}
              sx={{ mb: 1 }}
            />
          ))}
        </Stack>
      </Box>
    </div>
  );
}
