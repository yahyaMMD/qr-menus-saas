// @ts-nocheck
"use client";

import Link from "next/link";
import { Shield, Lock, Eye, Database, Users, FileText } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Shield className="w-16 h-16 text-orange-500 mx-auto mb-6" />
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-600">
              Last updated: March 4, 2024
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12 space-y-12">
            {/* Introduction */}
            <div>
              <p className="text-gray-700 text-lg leading-relaxed">
                At QResto, we are committed to protecting your privacy and ensuring the security
                of your personal information. This Privacy Policy explains how we collect, use, disclose,
                and safeguard your information when you use our digital menu platform and services.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed mt-4">
                By using QResto, you agree to the collection and use of information in accordance
                with this policy. If you do not agree with our policies and practices, please do not use
                our services.
              </p>
            </div>

            {/* Information We Collect */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Database className="w-8 h-8 text-orange-500" />
                <h2 className="text-3xl font-bold text-gray-900">
                  1. Information We Collect
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    1.1 Information You Provide
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>
                      <strong>Account Information:</strong> Name, email address, phone number,
                      business name, and password when you register for an account
                    </li>
                    <li>
                      <strong>Restaurant Profile:</strong> Restaurant name, location, contact
                      information, logo, and business details
                    </li>
                    <li>
                      <strong>Menu Information:</strong> Menu items, descriptions, prices, images,
                      categories, and customization options
                    </li>
                    <li>
                      <strong>Payment Information:</strong> Billing address and payment details
                      (processed securely through our payment provider Chargily)
                    </li>
                    <li>
                      <strong>Communications:</strong> Messages, feedback, and support requests
                      you send to us
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    1.2 Information We Collect Automatically
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>
                      <strong>Usage Data:</strong> QR code scans, menu views, popular items,
                      customer interaction patterns, and analytics data
                    </li>
                    <li>
                      <strong>Device Information:</strong> IP address, browser type, device type,
                      operating system, and mobile device identifiers
                    </li>
                    <li>
                      <strong>Location Data:</strong> Approximate location based on IP address
                      for analytics purposes
                    </li>
                    <li>
                      <strong>Cookies and Tracking:</strong> We use cookies and similar tracking
                      technologies to track activity and store certain information
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    1.3 Customer Data
                  </h3>
                  <p className="text-gray-700">
                    When end-users (restaurant customers) scan QR codes and view menus, we collect
                    minimal anonymous data such as scan timestamps, device types, and viewing patterns
                    to provide analytics to restaurant owners. We do not collect personal information
                    from end-users unless they voluntarily provide feedback.
                  </p>
                </div>
              </div>
            </div>

            {/* How We Use Your Information */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Eye className="w-8 h-8 text-orange-500" />
                <h2 className="text-3xl font-bold text-gray-900">
                  2. How We Use Your Information
                </h2>
              </div>

              <p className="text-gray-700 mb-4">
                We use the information we collect for the following purposes:
              </p>

              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>
                  <strong>Service Provision:</strong> To create and manage your account, process
                  subscriptions, and provide access to our platform
                </li>
                <li>
                  <strong>QR Code & Menu Management:</strong> To generate QR codes, host digital
                  menus, and enable menu customization
                </li>
                <li>
                  <strong>Analytics:</strong> To provide you with insights about menu views, popular
                  items, scan counts, and customer behavior
                </li>
                <li>
                  <strong>Payment Processing:</strong> To process your subscription payments and
                  handle billing inquiries
                </li>
                <li>
                  <strong>Communication:</strong> To send you service updates, technical notices,
                  support responses, and marketing communications (with your consent)
                </li>
                <li>
                  <strong>Improvement:</strong> To improve our services, develop new features,
                  and enhance user experience
                </li>
                <li>
                  <strong>Security:</strong> To monitor and prevent fraud, unauthorized access,
                  and other malicious activities
                </li>
                <li>
                  <strong>Legal Compliance:</strong> To comply with legal obligations and enforce
                  our Terms of Service
                </li>
              </ul>
            </div>

            {/* Information Sharing */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-8 h-8 text-orange-500" />
                <h2 className="text-3xl font-bold text-gray-900">
                  3. How We Share Your Information
                </h2>
              </div>

              <p className="text-gray-700 mb-4">
                We do not sell your personal information. We may share your information in the
                following circumstances:
              </p>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    3.1 Service Providers
                  </h3>
                  <p className="text-gray-700">
                    We work with trusted third-party service providers who assist us in operating
                    our platform:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mt-2">
                    <li>Payment processing (Chargily, EDAHABIA, CIB)</li>
                    <li>Cloud hosting and infrastructure providers</li>
                    <li>Email communication services</li>
                    <li>Analytics and performance monitoring tools</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    3.2 Business Transfers
                  </h3>
                  <p className="text-gray-700">
                    If QResto is involved in a merger, acquisition, or sale of assets, your
                    information may be transferred as part of that transaction.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    3.3 Legal Requirements
                  </h3>
                  <p className="text-gray-700">
                    We may disclose your information if required by law or in response to valid
                    requests by public authorities (e.g., court orders or government agencies).
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    3.4 With Your Consent
                  </h3>
                  <p className="text-gray-700">
                    We may share your information for any other purpose with your explicit consent.
                  </p>
                </div>
              </div>
            </div>

            {/* Data Security */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Lock className="w-8 h-8 text-orange-500" />
                <h2 className="text-3xl font-bold text-gray-900">
                  4. Data Security
                </h2>
              </div>

              <p className="text-gray-700 mb-4">
                We implement industry-standard security measures to protect your information:
              </p>

              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Encryption of data in transit using SSL/TLS protocols</li>
                <li>Secure password hashing and authentication mechanisms</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and authentication for our systems</li>
                <li>Secure payment processing through PCI-compliant providers</li>
              </ul>

              <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-gray-700">
                  <strong>Please note:</strong> No method of transmission over the internet or
                  electronic storage is 100% secure. While we strive to use commercially acceptable
                  means to protect your information, we cannot guarantee absolute security.
                </p>
              </div>
            </div>

            {/* Your Rights */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-8 h-8 text-orange-500" />
                <h2 className="text-3xl font-bold text-gray-900">
                  5. Your Rights and Choices
                </h2>
              </div>

              <p className="text-gray-700 mb-4">
                You have the following rights regarding your personal information:
              </p>

              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>
                  <strong>Access:</strong> Request access to the personal information we hold
                  about you
                </li>
                <li>
                  <strong>Correction:</strong> Update or correct inaccurate or incomplete
                  information
                </li>
                <li>
                  <strong>Deletion:</strong> Request deletion of your account and associated data
                </li>
                <li>
                  <strong>Data Portability:</strong> Request a copy of your data in a
                  machine-readable format
                </li>
                <li>
                  <strong>Opt-Out:</strong> Unsubscribe from marketing communications at any time
                </li>
                <li>
                  <strong>Objection:</strong> Object to certain processing of your personal
                  information
                </li>
              </ul>

              <p className="text-gray-700 mt-4">
                To exercise any of these rights, please contact us at{" "}
                <a
                  href="mailto:privacy@qresto.com"
                  className="text-orange-500 hover:text-orange-600 font-medium"
                >
                  privacy@qresto.com
                </a>
              </p>
            </div>

            {/* Data Retention */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">6. Data Retention</h2>
              <p className="text-gray-700">
                We retain your personal information for as long as necessary to provide our services
                and fulfill the purposes outlined in this Privacy Policy. When you delete your account,
                we will delete or anonymize your personal information within 30 days, except where we
                are required to retain it for legal, accounting, or security purposes.
              </p>
            </div>

            {/* Cookies */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">7. Cookies and Tracking</h2>
              <p className="text-gray-700 mb-4">
                We use cookies and similar tracking technologies to enhance your experience:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>
                  <strong>Essential Cookies:</strong> Required for basic functionality (login,
                  security)
                </li>
                <li>
                  <strong>Analytics Cookies:</strong> Help us understand how users interact with
                  our platform
                </li>
                <li>
                  <strong>Preference Cookies:</strong> Remember your settings and preferences
                </li>
              </ul>
              <p className="text-gray-700 mt-4">
                You can control cookies through your browser settings, but disabling certain cookies
                may affect functionality.
              </p>
            </div>

            {/* Children's Privacy */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">8. Children's Privacy</h2>
              <p className="text-gray-700">
                QResto is not intended for individuals under the age of 18. We do not knowingly
                collect personal information from children. If we become aware that we have collected
                personal information from a child without parental consent, we will take steps to
                delete that information.
              </p>
            </div>

            {/* International Data Transfers */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                9. International Data Transfers
              </h2>
              <p className="text-gray-700">
                Your information may be transferred to and maintained on servers located outside of
                your country where data protection laws may differ. By using QResto, you consent
                to the transfer of your information to these locations. We take appropriate safeguards
                to ensure your data is treated securely and in accordance with this Privacy Policy.
              </p>
            </div>

            {/* Changes to Policy */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                10. Changes to This Privacy Policy
              </h2>
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time. We will notify you of any material
                changes by posting the new Privacy Policy on this page and updating the "Last Updated"
                date. We encourage you to review this Privacy Policy periodically for any changes.
                Your continued use of QResto after changes are posted constitutes your acceptance
                of the updated policy.
              </p>
            </div>

            {/* Contact */}
            <div className="bg-orange-50 rounded-xl p-8 border border-orange-200">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions, concerns, or requests regarding this Privacy Policy or
                our data practices, please contact us:
              </p>
              <div className="space-y-2 text-gray-700">
                <p>
                  <strong>Email:</strong>{" "}
                  <a
                    href="mailto:privacy@qresto.com"
                    className="text-orange-500 hover:text-orange-600"
                  >
                    privacy@qresto.com
                  </a>
                </p>
                <p>
                  <strong>Support:</strong>{" "}
                  <a
                    href="mailto:support@qresto.com"
                    className="text-orange-500 hover:text-orange-600"
                  >
                    support@qresto.com
                  </a>
                </p>
                <p>
                  <strong>Address:</strong> QResto, Algiers, Algeria
                </p>
              </div>
            </div>
          </div>

          {/* Related Links */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">Related Legal Documents</p>
            <div className="flex justify-center gap-4">
              <Link
                href="/legal/terms"
                className="text-orange-500 hover:text-orange-600 font-medium"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
