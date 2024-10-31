"use client";

import { AlertModal } from "@/components/modals/alert-modal";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc/client";
import { MoreHorizontal, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface TagCellActionProps {
  data: Tag;
}

export const TagCellAction: React.FC<TagCellActionProps> = ({ data }) => {
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();

  const { mutate: deleteTag, isLoading } = trpc.tags.delete.useMutation({
    onSuccess: () => {
      toast.success("Tag deleted successfully");
      utils.tags.getAll.invalidate();
      setOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={() => deleteTag({ id: data.id })}
        loading={isLoading}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};