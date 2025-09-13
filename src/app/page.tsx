import { HydrateClient } from "@/trpc/server";
import { Landing } from "@/app/_components/landing";

export default async function Home() {
  return (
    <HydrateClient>
      <Landing />
    </HydrateClient>
  );
}
