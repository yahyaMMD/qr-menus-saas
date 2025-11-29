// @ts-nocheck
import { use } from 'react';
import { RestaurantProfile } from "../../../../components/dashboard/RestaurantProfile";

export default function RestaurantProfilePage({ 
  params 
}: { 
  params: Promise<{ profileId: string }> 
}) {
  const { profileId } = use(params);
  
  return <RestaurantProfile profileId={profileId} />;
}
