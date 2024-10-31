"use client";


import { CreateTagModal } from "@/components/modals/create-tag-modal";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc/client";
import { Plus } from "lucide-react";
import { useState } from "react";
import { columns } from "./columns";

export const TagsClient = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: tags, isLoading } = trpc.tags.getAll.useQuery();

  return (
    <>
      <div className="flex items-start justify-between">
        <Heading 
          title={`Tags (${tags?.length || 0})`} 
          description="Manage your tags" 
        />
        <Button
          className="text-xs md:text-sm"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Create Tag
        </Button>
      </div>
      <Separator />
      <DataTable 
        searchKey="name" 
        columns={columns} 
        data={tags || []} 
        isLoading={isLoading} 
      />
      <CreateTagModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};