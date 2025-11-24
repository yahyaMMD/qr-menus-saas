// @ts-nocheck
import { MenuBuilder } from "../../../../../../components/dashboard/MenuBuilder";

export default function NewMenuPage({ params }: { params: { profileId: string } }) {
  return <MenuBuilder profileId={params.profileId} />;
}
