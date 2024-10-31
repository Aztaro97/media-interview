import { getUserAuth } from "@/lib/auth/utils";

export default async function Home() {
  const userAuth = await getUserAuth();
  return (
    <main className="space-y-6">
      <pre className="bg-secondary p-4 rounded-sm shadow-sm text-secondary-foreground break-all whitespace-break-spaces">
        {JSON.stringify(userAuth, null, 2)}
      </pre>
    </main>
  );
}
