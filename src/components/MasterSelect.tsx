// /pocoapoke/src/components/MasterSelect.tsx
import { Chip, Stack, Typography } from "@mui/material";
import type { Master } from "../api/useMasterCodes";

type Props = {
  className: string; // "specialty" など
  label: string;
  // masterCodes: Record<string, { id: number; code: number; label: string }[]>;
  masterCodes: Master;
  value: number | null;
  // onChange: (value: number | null) => void;
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
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        {label}
      </Typography>
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
    </div>
    // <div>
    //   <label>{label}</label>
    //   <select
    //     value={value ?? ""}
    //     onChange={(e) =>
    //       onChange(e.target.value ? Number(e.target.value) : null)
    //     }
    //   >
    //     <option value="">選択してください</option>
    //     {items.map((m) => (
    //       <option key={m.id} value={m.id}>
    //         {m.label}
    //       </option>
    //     ))}
    //   </select>
    // </div>
  );
}
