"use client";

import { Tag } from "@/@types/tag";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import { TagCellAction } from "./cell-action";

export const columns: ColumnDef<Tag>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "NAME",
  },
  {
    accessorKey: "createdAt",
    header: "CREATED",
    cell: ({ row }) => (
      <span>
        {dayjs(row.original.createdAt).format("DD MMM, YYYY")}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <TagCellAction data={row.original} />,
  },
];