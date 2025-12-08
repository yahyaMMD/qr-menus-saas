import { AppLoader } from "@/components/ui/AppLoader";

export default function Loading() {
  return <AppLoader message="Loading admin console" subtext="Syncing users, subscriptions, and support tickets..." />;
}
