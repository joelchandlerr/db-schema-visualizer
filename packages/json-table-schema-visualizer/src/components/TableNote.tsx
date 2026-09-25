import { useEffect, type RefObject } from "react";
import Konva from "konva";

import { useThemeColors } from "@/hooks/theme";
import { FONT_FAMILY } from "@/constants/font";
import { FONT_SIZES, PADDINGS } from "@/constants/sizing";
import { computeFieldDetailBoxDimension } from "@/utils/computeFieldDetailBoxDimension";

interface TableNoteProps {
  headerRef: RefObject<Konva.Group>;
  title: string;
  note: string;
  accentColor: string;
}

/** A transient canvas layer keeps notes above tables without changing table order. */
const TableNote = ({ headerRef, title, note, accentColor }: TableNoteProps) => {
  const colors = useThemeColors();

  useEffect(() => {
    const header = headerRef.current;
    const stage = header?.getStage();
    if (header == null || stage == null) return;

    let layer: Konva.Layer | undefined;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    let scrollY = 0;
    let maxScroll = 0;
    let noteText: Konva.Text | undefined;

    const cancelHide = () => {
      clearTimeout(hideTimer);
    };
    const hide = () => {
      cancelHide();
      layer?.destroy();
      layer = undefined;
      noteText = undefined;
    };
    const scheduleHide = () => {
      cancelHide();
      hideTimer = setTimeout(hide, 120);
    };

    const draw = () => {
      if (layer == null) return;
      layer.destroyChildren();
      // Keep the same canvas scale as field notes; cancel only the pan offset.
      const scale = stage.scale();
      layer.position({ x: -stage.x() / scale.x, y: -stage.y() / scale.y });
      const viewportWidth = stage.width() / scale.x;
      const viewportCanvasHeight = stage.height() / scale.y;
      const margin = PADDINGS.sm;
      const padding = PADDINGS.md;
      const width = Math.max(
        1,
        Math.min(
          computeFieldDetailBoxDimension(note).w + padding * 2,
          viewportWidth - margin * 2,
        ),
      );
      const textWidth = Math.max(1, width - padding * 2);
      const textStyle = {
        fontFamily: FONT_FAMILY,
        fontSize: FONT_SIZES.md,
        fill: colors.white,
        width: textWidth,
        wrap: "word",
      };
      const heading = new Konva.Text({
        ...textStyle,
        text: title,
        fontStyle: "bold",
        x: padding,
        y: padding,
      });
      const dividerY = padding + heading.height() + PADDINGS.sm;
      const bodyY = dividerY + PADDINGS.sm;
      noteText = new Konva.Text({ ...textStyle, text: note });
      const naturalHeight = bodyY + noteText.height() + padding;
      const height = Math.max(
        1,
        Math.min(naturalHeight, viewportCanvasHeight - margin * 2),
      );
      // Very small previews scroll the entire card, keeping every line reachable.
      const viewportHeight = Math.max(1, height - padding * 2);
      maxScroll = Math.max(0, naturalHeight - padding * 2 - viewportHeight);
      scrollY = Math.min(scrollY, maxScroll);
      const screenBounds = header.getClientRect();
      const bounds = {
        x: screenBounds.x / scale.x,
        y: screenBounds.y / scale.y,
        width: screenBounds.width / scale.x,
        height: screenBounds.height / scale.y,
      };
      const rightX = bounds.x + bounds.width + PADDINGS.xs;
      const x = rightX;
      const y = Math.max(
        margin,
        Math.min(bounds.y, viewportCanvasHeight - height - margin),
      );
      const card = new Konva.Group({ x, y });
      const caretY = Math.max(
        6,
        Math.min(bounds.y + bounds.height / 2 - y, height - 6),
      );
      card.add(
        new Konva.Line({
          points: [0, caretY - 5, -5, caretY, 0, caretY + 5],
          closed: true,
          fill: colors.noteBg,
        }),
      );
      card.add(
        new Konva.Rect({
          width,
          height,
          fill: colors.noteBg,
          cornerRadius: 5,
        }),
      );
      card.add(
        new Konva.Rect({
          x: 0,
          y: 0,
          width: Math.min(3, width),
          height,
          fill: accentColor,
          cornerRadius: [5, 0, 0, 5],
          listening: false,
        }),
      );
      const viewport = new Konva.Group({
        x: 0,
        y: padding,
        clipX: 0,
        clipY: 0,
        clipWidth: width,
        clipHeight: viewportHeight,
      });
      const content = new Konva.Group({
        y: -padding - scrollY,
        listening: false,
      });
      content.add(heading);
      content.add(
        new Konva.Line({
          points: [padding, dividerY, width - padding, dividerY],
          stroke: colors.white,
          strokeWidth: 1,
          opacity: 0.2,
        }),
      );
      noteText.position({ x: padding, y: bodyY });
      content.add(noteText);
      viewport.add(content);
      card.add(viewport);
      if (maxScroll > 0) {
        card.add(
          new Konva.Rect({
            x: width - 5,
            y: padding + ((viewportHeight - 20) * scrollY) / maxScroll,
            width: 2,
            height: Math.min(20, viewportHeight),
            fill: colors.white,
            opacity: 0.6,
            listening: false,
          }),
        );
      }
      card.on("mouseenter", cancelHide);
      card.on("mouseleave", scheduleHide);
      card.on("mousedown touchstart", (event) => {
        event.cancelBubble = true;
      });
      card.on("wheel", (event) => {
        event.evt.preventDefault();
        event.cancelBubble = true;
        scrollY = Math.max(
          0,
          Math.min(maxScroll, scrollY + event.evt.deltaY / scale.y),
        );
        draw();
      });
      layer.add(card);
      layer.moveToTop();
      layer.batchDraw();
    };

    const show = () => {
      cancelHide();
      if (stage.isDragging() || header.getParent()?.isDragging() === true)
        return;
      stage.fire("tableNoteOpen", { target: header });
      if (layer == null) {
        scrollY = 0;
        layer = new Konva.Layer();
        stage.add(layer);
      }
      draw();
    };
    const onOtherNote = (event: Konva.KonvaEventObject<Event>) => {
      if (event.target !== header) hide();
    };
    const onCanvasHover = (event: Konva.KonvaEventObject<MouseEvent>) => {
      if (
        layer == null ||
        event.target.getLayer() === layer ||
        header.isAncestorOf(event.target)
      )
        return;
      // Close immediately over a column, before its own details appear.
      let node: Konva.Node | null = event.target;
      while (node != null) {
        if (
          node
            .name()
            .split(/\s+/)
            .some((name) => name.startsWith("table-"))
        ) {
          hide();
          return;
        }
        node = node.getParent();
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") hide();
    };
    const onPointerDown = (event: PointerEvent) => {
      // Toolbar actions (fit/export) should not include transient note bounds.
      if (!stage.container().contains(event.target as Node)) hide();
    };
    header.on("mouseenter.tableNote", show);
    header.on("mouseleave.tableNote", scheduleHide);
    const transformEvents =
      "xChange.tableNote yChange.tableNote scaleXChange.tableNote scaleYChange.tableNote widthChange.tableNote heightChange.tableNote";
    stage.on(transformEvents, draw);
    stage.on("dragstart.tableNote", hide);
    stage.on("tableNoteOpen.tableNote", onOtherNote);
    stage.on("mouseover.tableNote", onCanvasHover);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      hide();
      header.off("mouseenter.tableNote", show);
      header.off("mouseleave.tableNote", scheduleHide);
      stage.off(transformEvents, draw);
      stage.off("dragstart.tableNote", hide);
      stage.off("tableNoteOpen.tableNote", onOtherNote);
      stage.off("mouseover.tableNote", onCanvasHover);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [headerRef, title, note, colors, accentColor]);

  return null;
};

export default TableNote;
