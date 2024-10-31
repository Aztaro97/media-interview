"use client";

import { FilesClient } from "@/components/tables/files-tables/client";
import { trpc } from "@/lib/trpc/client";

export default function FileManagementPage() {

	const { data, isLoading } = trpc.files.getAll.useInfiniteQuery({
		limit: 10,
	});

	const filesData = data?.pages.flatMap((page) => page.items) || [];


  return (
    <div className="flex-1 space-y-4">
      <FilesClient data={filesData || []} isLoading={isLoading} />
    </div>
  );
}
