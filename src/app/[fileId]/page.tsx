'use client'

import FilePreview from "@/components/ FilePreview";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc/client";
import { useParams, useRouter } from "next/navigation";

export default function FilePage() {
  const router = useRouter();
  const params = useParams();

  const { data: file, isLoading } = trpc.files.getById.useQuery(
    {
      id: params.fileId as string,
      ipAddress: "client-side",
      userAgent: navigator.userAgent
    },
    {
      onError: () => router.push('/404'),
      onSuccess: (data) => {
        if (!data) router.push('/404');
      }
    }
  );

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-6">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-[400px] w-full mb-6" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log("file ", file);

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold mb-4">{file.name}</h1>
          
          <div className="grid gap-6">
            <FilePreview file={file} />
            {/* <FileStats fileId={file.id} /> */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 