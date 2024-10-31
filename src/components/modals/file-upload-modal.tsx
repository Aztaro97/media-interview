import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import MultipleSelector from "@/components/ui/multiple-selector";
import { FileUploader } from "@/components/ui/uploader/file-uploader";
import { trpc } from "@/lib/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const optionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

const formSchema = z.object({
  file: z.array(z.instanceof(File)),
  tags: z.array(optionSchema).min(1),
});

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [presignedUrl, setPresignedUrl] = useState<string | null>(null);

  const utils = trpc.useUtils();

  const { data: tagsOptions } = trpc.tags.getAllTagsOptions.useQuery();
  const { mutateAsync: fetchPresignedUrls } =
    trpc.s3.getStandardUploadPresignedUrl.useMutation();

  const { mutateAsync: createFile } = trpc.files.create.useMutation({
    onSuccess: () => {
      toast.success("File uploaded successfully");
      onClose();
      utils.files.getAll.invalidate();
      form.reset();
    },
    onError: () => {
      toast.error("Error uploading file");
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      file: undefined,
      tags: [],
    },
  });

  const handleFileUpload = async (files: File[]) => {
    try {
      setLoading(true);
      const file = files[0];

      const { presignedUrl, fileUrl } = await fetchPresignedUrls({
        key: file.name,
        directoryPath: "documents",
      });

      // Upload to S3 using presigned URL
      await fetch(presignedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      setPresignedUrl(fileUrl);
      form.setValue("file", files, { shouldValidate: true });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Error uploading file");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!presignedUrl) return;

    try {
      setLoading(true);
      const file = values.file[0];

      // Create file record with all required fields
      await createFile({
        name: file.name,
        type: file.type,
        size: file.size,
        url: presignedUrl,
        tags: values.tags.map((tag) => tag.value),
      });
    } catch (error) {
      console.error("Error creating file record:", error);
      toast.error("Error creating file record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <div className="space-y-6">
                  <FormItem className="w-full">
                    <FormLabel>File</FormLabel>
                    <FormControl>
                      <FileUploader
                        value={field.value}
                        onValueChange={field.onChange}
                        maxFiles={1}
                        accept={{ "image/*": [], "video/*": [] }}
                        onUpload={handleFileUpload}
                        //   disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </div>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <MultipleSelector
                      {...field}
                      defaultOptions={tagsOptions || []}
                      placeholder="Enter tags..."
                      emptyIndicator={
                        <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                          no results found.
                        </p>
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
