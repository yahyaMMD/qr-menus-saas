// @ts-nocheck
import { RestaurantProfile } from "../../../../components/dashboard/RestaurantProfile";

export default function RestaurantProfilePage({ params }: { params: { profileId: string } }) {
  return <RestaurantProfile profileId={params.profileId} />;
}
