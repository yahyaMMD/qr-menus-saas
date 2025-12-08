import { AppLoader } from "@/components/ui/AppLoader";

export default function Loading() {
  return <AppLoader message="Loading dashboard" subtext="Fetching your profiles, menus, and analytics..." />;
}
