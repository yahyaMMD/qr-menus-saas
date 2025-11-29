// @ts-nocheck
"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Check, CreditCard } from "lucide-react";

export default function SubscriptionsPage() {
  const currentPlan = {
    name: "Standard Plan",
    price: 29,
    billingCycle: "month",
    nextBillingDate: "Dec 29, 2025",
    features: [
      "Up to 5 restaurant profiles",
      "Unlimited menus",
      "QR code generation",
      "Basic analytics",
      "Email support",
    ],
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your subscription and billing
          </p>
        </div>

        {/* Current Plan Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {currentPlan.name}
              </h2>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">
                  ${currentPlan.price}
                </span>
                <span className="text-gray-600">/{currentPlan.billingCycle}</span>
              </div>
            </div>
            <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-medium">
              Active
            </div>
          </div>

          <div className="mb-6">
            <div className="text-sm text-gray-600 mb-2">Features included:</div>
            <div className="space-y-2">
              {currentPlan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Next billing date:{" "}
              <span className="font-semibold text-gray-900">
                {currentPlan.nextBillingDate}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Change Plan
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                Cancel Subscription
              </Button>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Payment Method
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-gray-600" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">
                •••• •••• •••• 4242
              </div>
              <div className="text-sm text-gray-600">Expires 12/25</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Update
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
