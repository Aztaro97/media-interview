import { getUserAuth } from "@/lib/auth/utils";
import { ClerkProvider } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
	const session = await getUserAuth();
	console.log("session ", session);
	if (session?.session) redirect("/dashboard");

  return ( <div className="bg-muted h-screen pt-8">
			<ClerkProvider>{children}</ClerkProvider>
		</div>
	);
}
