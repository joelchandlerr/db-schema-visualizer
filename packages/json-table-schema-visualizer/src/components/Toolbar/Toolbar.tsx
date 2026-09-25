import PropTypes from "prop-types";
import { Minus, Plus } from "lucide-react";

import AutoArrangeTableButton from "./AutoArrage/AutoArrangeTables";
import ThemeToggler from "./ThemeToggler/ThemeToggler";
import DetailLevelToggle from "./DetailLevelToggle/DetailLevelToggle";
import FitToViewButton from "./FitToView/FitToView";
import ExportButton from "./Export/Export";

const Toolbar = ({
  onFitToView,
  onDownload,
  zoom,
  onZoomChange,
}: {
  onFitToView: () => void;
  onDownload: () => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
}) => {
  // Include exceptional Fit to View scales without restricting existing wheel zoom.
  const minZoom = Math.min(0.1, zoom);
  const maxZoom = Math.max(3, zoom);
  const buttonClass =
    "p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 disabled:opacity-40";
  return (
    <div className="flex flex-wrap justify-center items-center max-w-full absolute [&_svg]:w-5 [&_svg]:h-5 px-6 py-1 bottom-14 text-sm bg-gray-100 dark:bg-gray-700 shadow-lg rounded-2xl">
      <AutoArrangeTableButton />
      <DetailLevelToggle />
      <FitToViewButton onClick={onFitToView} />
      <div
        role="group"
        aria-label="Diagram zoom"
        className="flex items-center gap-2 px-2 text-gray-600 dark:text-gray-300"
      >
        <button
          type="button"
          aria-label="Zoom out"
          title="Zoom out"
          className={buttonClass}
          disabled={zoom <= minZoom}
          onClick={() => onZoomChange(Math.max(minZoom, zoom - 0.1))}
        >
          <Minus aria-hidden="true" />
        </button>
        <input
          type="range"
          aria-label="Zoom level"
          aria-valuetext={`${Math.round(zoom * 100)} percent`}
          min={minZoom}
          max={maxZoom}
          step="any"
          value={zoom}
          onChange={(event) => onZoomChange(Number(event.target.value))}
          onKeyDown={(event) => {
            const direction =
              event.key === "ArrowRight" || event.key === "ArrowUp"
                ? 1
                : event.key === "ArrowLeft" || event.key === "ArrowDown"
                  ? -1
                  : 0;
            if (direction !== 0) {
              event.preventDefault();
              onZoomChange(
                Math.max(minZoom, Math.min(maxZoom, zoom + direction * 0.05)),
              );
            }
          }}
          className="w-24 h-6 cursor-pointer accent-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
        />
        <button
          type="button"
          aria-label="Zoom in"
          title="Zoom in"
          className={buttonClass}
          disabled={zoom >= maxZoom}
          onClick={() => onZoomChange(Math.min(maxZoom, zoom + 0.1))}
        >
          <Plus aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Reset zoom to 100 percent"
          title="Reset zoom to 100%"
          onClick={() => onZoomChange(1)}
          className={`${buttonClass} w-14 tabular-nums text-xs`}
        >
          {Math.round(zoom * 100)}%
        </button>
      </div>
      <hr className="mx-4 my-1 w-px h-6 bg-gray-300" />
      <ExportButton onDownload={onDownload} />
      <hr className="mx-4 my-1 w-px h-6 bg-gray-300" />
      <ThemeToggler />
    </div>
  );
};

Toolbar.propTypes = {
  onFitToView: PropTypes.func.isRequired,
};

export default Toolbar;
