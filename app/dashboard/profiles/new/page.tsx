// @ts-nocheck
import { CreateRestaurantForm } from "../../../../components/dashboard/CreateRestaurantForm";

export default function CreateRestaurantPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Create Restaurant Profile
      </h1>
      <CreateRestaurantForm />
    </div>
  );
}
