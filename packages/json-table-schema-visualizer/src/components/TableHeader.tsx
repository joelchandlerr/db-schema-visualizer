import { Group, Rect, Line } from "react-konva";
import { useRef } from "react";
import type Konva from "konva";

import KonvaText from "./dumb/KonvaText";
import TableNote from "./TableNote";

import {
  COLUMN_HEIGHT,
  FONT_SIZES,
  PADDINGS,
  TABLE_COLOR_HEIGHT,
} from "@/constants/sizing";
import { useThemeColors } from "@/hooks/theme";
import { useTableColor } from "@/hooks/tableColor";
import { useTableWidth } from "@/hooks/table";

interface TableHeaderProps {
  title: string;
  note?: string;
}

const TableHeader = ({ title, note }: TableHeaderProps) => {
  const headerRef = useRef<Konva.Group>(null);
  const hasNote = typeof note === "string" && note.trim().length > 0;
  const themeColors = useThemeColors();
  const tableColors = useTableColor(title);
  const tablePreferredWidth = useTableWidth();
  const tableMarkerColor = tableColors?.regular ?? "red";

  return (
    <Group ref={headerRef}>
      <Rect
        cornerRadius={[PADDINGS.sm, PADDINGS.sm]}
        fill={tableMarkerColor}
        height={TABLE_COLOR_HEIGHT}
        width={tablePreferredWidth}
      />

      <Rect
        y={TABLE_COLOR_HEIGHT}
        fill={themeColors.tableHeader.bg}
        width={tablePreferredWidth}
        height={COLUMN_HEIGHT}
      />

      <KonvaText
        text={title}
        y={TABLE_COLOR_HEIGHT}
        fill={themeColors.tableHeader.fg}
        width={tablePreferredWidth - (hasNote ? 26 : 0)}
        wrap="none"
        ellipsis
        height={COLUMN_HEIGHT}
        align="center"
        strokeWidth={PADDINGS.xs}
        padding={PADDINGS.xs}
        fontSize={FONT_SIZES.tableTitle}
      />
      {hasNote && (
        <>
          <Group
            x={tablePreferredWidth - 22}
            y={TABLE_COLOR_HEIGHT + 8}
            listening={false}
          >
            <Rect
              width={12}
              height={14}
              stroke={themeColors.tableHeader.fg}
              cornerRadius={2}
            />
            <Line points={[3, 4, 9, 4]} stroke={themeColors.tableHeader.fg} />
            <Line points={[3, 7, 9, 7]} stroke={themeColors.tableHeader.fg} />
            <Line points={[3, 10, 7, 10]} stroke={themeColors.tableHeader.fg} />
          </Group>
          <TableNote
            headerRef={headerRef}
            title={title}
            note={note!}
            accentColor={tableMarkerColor}
          />
        </>
      )}
    </Group>
  );
};

export default TableHeader;
