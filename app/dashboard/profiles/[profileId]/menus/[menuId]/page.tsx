// @ts-nocheck
import { MenuBuilder } from "../../../../../../components/dashboard/MenuBuilder";

export default function EditMenuPage({ params }: { params: { profileId: string; menuId: string } }) {
  return <MenuBuilder profileId={params.profileId} menuId={params.menuId} />;
}
