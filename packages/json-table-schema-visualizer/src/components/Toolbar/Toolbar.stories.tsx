import { type Meta, type StoryObj } from "@storybook/react";
import { useState } from "react";

import Toolbar from "./Toolbar";

import TablesPositionsProvider from "@/providers/TablesPositionsProvider";

const meta: Meta = {
  component: Toolbar,
  title: "components/Toolbar",
};

export default meta;

type Story = StoryObj<typeof Toolbar>;

const ToolbarPreview = () => {
  const [zoom, setZoom] = useState(0.75);
  return (
    <Toolbar
      onFitToView={() => setZoom(0.75)}
      onDownload={() => {}}
      zoom={zoom}
      onZoomChange={setZoom}
    />
  );
};

export const ToolbarStory: Story = {
  render: () => <ToolbarPreview />,
  decorators: [
    (Story) => (
      <div className="py-32">
        <TablesPositionsProvider tables={[]} refs={[]}>
          <Story />
        </TablesPositionsProvider>
      </div>
    ),
  ],
};
