"use client";

import type { TFile } from "@/@types/file";
import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import { Copy, FileIcon, ImageIcon, Share2, VideoIcon } from "lucide-react";
import { toast } from "sonner";

import { Checkbox } from "@/components/ui/checkbox";
import { CellAction } from "./cell-action";

export const columns: ColumnDef<TFile>[] = [
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
    header: "FILE NAME",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.type === 'image' ? (
          <ImageIcon className="h-4 w-4" />
        ) : row.original.type === 'video' ? (
          <VideoIcon className="h-4 w-4" />
        ) : (
          <FileIcon className="h-4 w-4" />
        )}
        <span>{row.original.name}</span>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "TYPE",
    cell: ({ row }) => (
      <span className="capitalize">{row.original.type}</span>
    ),
  },
  {
    accessorKey: "size",
    header: "SIZE",
    cell: ({ row }) => (
      <span>
        {(row.original.size / (1024 * 1024)).toFixed(2)} MB
      </span>
    ),
  },
  {
    accessorKey: "tags",
    header: "TAGS",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.tags?.map((tag) => (
          <span
            key={tag.id}
            className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs"
          >
            {tag.name}
          </span>
        ))}
      </div>
    ),
  },
  {
    accessorKey: "views",
    header: "VIEWS",
    cell: ({ row }) => (
      <span>{row.original.viewCount || 0}</span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "UPLOADED",
    cell: ({ row }) => (
      <span>
        {dayjs(row.original.createdAt).format("DD MMM, YYYY")}
      </span>
    ),
  },
  {
    id: "share",
    header: "SHARE",
    cell: ({ row }) => {
      const fileUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/${row.original.id}`;

      const handleCopy = () => {
        navigator.clipboard.writeText(fileUrl);
        toast.success("Link copied to clipboard!");
      };

      const handleShare = async () => {
        if (navigator.share) {
          try {
            await navigator.share({
              title: row.original.name,
              text: `Check out this file: ${row.original.name}`,
              url: fileUrl,
            });
          } catch (err) {
            handleCopy(); // Fallback to copy if share fails
          }
        } else {
          handleCopy(); // Fallback for browsers without share API
        }
      };

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleCopy}
            title="Copy link"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleShare}
            title="Share file"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
