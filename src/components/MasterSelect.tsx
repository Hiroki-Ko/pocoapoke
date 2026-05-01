// /pocoapoke/src/components/MasterSelect.tsx
import { Chip, Box } from "@mui/material";
import type { Master } from "../api/useMasterCodes";

type Props = {
  className: string; // "specialty" など
  label: string;
  masterCodes: Master;
  value: number | number[];
  onChange: (id: number | number[]) => void;
};

export function MasterSelect({
  className,
  label,
  masterCodes,
  value,
  onChange,
}: Props) {
  const items = masterCodes?.[className] ?? [];
  const isMulti = Array.isArray(value);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        mb: 0,
      }}
    >
      {/* 左側：項目名（固定） */}
      <Box
        sx={{
          width: "110px",      // ← スマホでも潰れない固定幅
          flexShrink: 0,
          fontWeight: "bold",
        }}
      >
        {label}
      </Box>

      {/* 右側：Chip の横スクロール領域 */}
      <Box
        sx={{
          display: "flex",
          overflowX: "auto",
          gap: 1,
          py: 1,
          px: 1,
          borderRadius: 1,
          bgcolor: "#fff",
          scrollbarWidth: "thin",
          "&::-webkit-scrollbar": { height: "6px" },
        }}
      >
        {items.map((m) => {
            const isSelected = isMulti
              ? value.includes(m.id)
              : value === m.id;

            const handleClick = () => {
              if (isMulti) {
                // 複数選択
                if (value.includes(m.id)) {
                  onChange(value.filter(v => v !== m.id));
                } else {
                  onChange([...value, m.id]);
                }
              } else {
                // 単一選択
                onChange(value === m.id ? null : m.id);
              }
            };

          return (
              <Chip
                key={m.id}
                label={m.label}
                color={isSelected ? "primary" : "default"}
                variant={isSelected ? "filled" : "outlined"}
                onClick={handleClick}
                sx={{ flexShrink: 0 }} // ← Chip が潰れない
              />
          )}
        )}
      </Box>
    </Box>
  );
}
