import TableHeader from "./TableHeader";

import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  component: TableHeader,
  title: "components/TableHeader",
};

export default meta;

type Story = StoryObj<typeof TableHeader>;

export const TableHeaderStory: Story = {
  render: (props) => <TableHeader {...props} />,
  args: {
    title: "users",
  },
  parameters: {
    withKonvaWrapper: true,
  },
};

export const DepartmentNote: Story = {
  ...TableHeaderStory,
  args: { title: "departments", note: "Stores department information." },
};

export const EmployeeNote: Story = {
  ...TableHeaderStory,
  args: {
    title: "employees",
    note: "Stores employee information, including the department assigned to each employee.",
  },
};

export const MultilineNote: Story = {
  ...TableHeaderStory,
  args: {
    title: "employees_with_a_very_long_table_name",
    note:
      "Stores employee information.\n\nDepartment assignments & special characters < > remain plain text.\n" +
      "Additional information about this table. ".repeat(80),
  },
};

export const BlankNote: Story = {
  ...TableHeaderStory,
  args: { title: "departments", note: "   " },
};
