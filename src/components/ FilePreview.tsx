import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";

interface FilePreviewProps {
  file: {
    id: string;
    name: string;
    url: string;
    type: string;
  } | null;
}

export default function FilePreview({ file }: FilePreviewProps) {
  if (!file) return null;

  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      {file.type.includes('image') ? (
        <AspectRatio ratio={16 / 9}>
          <Image
            src={file.url}
            alt={file.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
        </AspectRatio>
      ) : (
        <AspectRatio ratio={16 / 9}>
          <video 
            controls
            className="h-full w-full"
            poster={`${file.url}?thumb=1`}
          >
            <source src={file.url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </AspectRatio>
      )}
    </div>
  );
}