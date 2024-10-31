import TrpcProvider from "@/lib/trpc/Provider";
import { cookies } from "next/headers";

export default async function FileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieString = (await cookies()).toString();
  return (
    <div className="bg-muted h-screen pt-8">
      <TrpcProvider cookies={cookieString}>{children}</TrpcProvider>
    </div>
  );
}
