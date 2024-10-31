"use client";

import type { DropzoneOptions } from "react-dropzone";
import { useEffect } from "react";
import Image from "next/image";
import { UploadIcon } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useFormContext } from "react-hook-form";

interface CustomDropzoneProps extends React.HTMLProps<HTMLDivElement> {
  dropzoneOptions?: DropzoneOptions;
  preview?: boolean;
  name?: string;
  text?: React.ReactNode;
  icon?: React.ReactNode;
}
const CustomDropzone: React.FC<CustomDropzoneProps> = ({
  dropzoneOptions,
  preview = false,
  name,
  text = <span className="font-semibold">Select media from your device</span>,
  icon,
  ...props
}) => {
  const { getInputProps, getRootProps, isDragActive, acceptedFiles } =
    useDropzone(dropzoneOptions);
  const formContext = useFormContext();
  // TODO: fix glitch on submit
  useEffect(() => {
    if (formContext) {
      if (!name) {
        throw new Error(
          "form value won't be added unless a name is passed add name to dropzone options",
        );
      }
      formContext.register(name);
      return formContext.unregister(name);
    }
  }, []);
  useEffect(() => {
    if (formContext) {
      if (!name) {
        throw new Error(
          "form value won't be added unless a name is passed add name to dropzone options",
        );
      }
      formContext.setValue(name, acceptedFiles[0]);
    }
  }, [acceptedFiles, name, formContext]);
  return (
    <div className="relative">
      <div
        {...props}
        {...getRootProps()}
        className={`bg-accent-active-inverted/10 grid cursor-pointer place-content-center justify-items-center rounded-lg border-2 border-dashed py-4 ${props.className}`}
      >
        <input {...getInputProps()} />
        {icon ?? <UploadIcon className="mb-2 h-8 w-8 text-muted-foreground" />}
        <p className="mb-2 pt-4 text-center text-base text-muted-foreground">
          {isDragActive ? (
            <span className="font-semibold">Drop Here</span>
          ) : (
            <> {text}</>
          )}
        </p>
        {preview &&
          acceptedFiles.map((file, idx) => {
            if (file.type.includes("image")) {
              return (
                <div key={idx} style={{ position: "relative" }}>
                  <Image
                    src={URL.createObjectURL(file)}
                    // layout="fill"
                    alt="preview"
                    className="object-cover"
                    height={200}
                    width={200}
                  />
                </div>
              );
            }
            if (file.type.includes("video")) {
              return (
                <video
                  key={idx}
                  className="absolute h-full w-full rounded-lg object-fill"
                  muted
                  loop
                  autoPlay
                >
                  <source src={URL.createObjectURL(file)} type="video/mp4" />
                </video>
              );
            }
            return file.name;
          })}
      </div>
      {name && formContext.formState.errors[name] && (
        <label className="text-sm font-medium text-destructive">
          {formContext.formState.errors[name].message?.toString()}
        </label>
      )}
    </div>
  );
};

export default CustomDropzone;
