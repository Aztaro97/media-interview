"use client";

import type { TFile } from "@/@types/file";
import { Plus } from "lucide-react";
import { useState } from "react";

import { FileUploadModal } from "@/components/modals/file-upload-modal";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

import { columns } from "./columns";

interface FilesClientProps {
  data: TFile[];
  isLoading?: boolean;
}

export const FilesClient: React.FC<FilesClientProps> = ({ data, isLoading }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex items-start justify-between">
        <Heading title={`Files (${data.length})`} description="Manage files" />
        <Button
          className="text-xs md:text-sm"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Upload File
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="name" columns={columns} data={data} isLoading={isLoading} />
      <FileUploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
