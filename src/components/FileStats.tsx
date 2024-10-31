import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/trpc/api";
import { Eye } from "lucide-react";

interface FileStatsProps {
  fileId: string;
}

export async function FileStats({ fileId }: FileStatsProps) {
  const stats = await api.files.getStats.query({ id: fileId });

  return (
    <div className="flex items-center gap-4">
      <Badge variant="secondary" className="flex items-center gap-1">
        <Eye className="h-3 w-3" />
        <span>{stats.viewsCount} views</span>
      </Badge>

      {stats.file.tags?.map((tag) => (
        <Badge key={tag.id} variant="outline">
          {tag.name}
        </Badge>
      ))}
    </div>
  );
}