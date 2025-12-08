// @ts-nocheck
"use client";

import Link from "next/link";
import { Scale, FileText, AlertCircle, CheckCircle, XCircle, UserCheck } from "lucide-react";
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Scale className="w-16 h-16 text-orange-500 mx-auto mb-6" />
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Terms of Service
            </h1>
            <p className="text-lg text-gray-600">
              Last Updated: November 30, 2025
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
                Welcome to Qresto! These Terms of Service ("Terms") govern your access to and use
                of Qresto's digital menu platform, QR code generation services, analytics tools,
                and related services (collectively, the "Service").
              </p>
              <p className="text-gray-700 text-lg leading-relaxed mt-4">
                By accessing or using Qresto, you agree to be bound by these Terms. If you do not
                agree to these Terms, you may not use our Service. Please read these Terms carefully
                before using Qresto.
              </p>
              
              <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-gray-700">
                  <strong>Important:</strong> These Terms contain an arbitration clause and class
                  action waiver that affect your legal rights. Please review Section 13 carefully.
                </p>
              </div>
            </div>

            {/* Acceptance of Terms */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <UserCheck className="w-8 h-8 text-orange-500" />
                <h2 className="text-3xl font-bold text-gray-900">
                  1. Acceptance of Terms
                </h2>
              </div>
              
              <p className="text-gray-700 mb-4">
                By creating an account, accessing our website, or using any part of our Service, you
                acknowledge that you have read, understood, and agree to be bound by these Terms and
                our Privacy Policy. You also represent that:
              </p>
              
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>You are at least 18 years of age or the age of majority in your jurisdiction</li>
                <li>You have the legal authority to enter into these Terms</li>
                <li>
                  If you are using the Service on behalf of a business, you have the authority to
                  bind that business to these Terms
                </li>
                <li>All information you provide is accurate and current</li>
              </ul>
            </div>

            {/* Service Description */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-8 h-8 text-orange-500" />
                <h2 className="text-3xl font-bold text-gray-900">
                  2. Service Description
                </h2>
              </div>

              <p className="text-gray-700 mb-4">
                Qresto provides a SaaS platform that enables restaurants and food service
                businesses to:
              </p>

              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Create and manage digital restaurant menus</li>
                <li>Generate QR codes for contactless menu access</li>
                <li>Track menu views, QR code scans, and customer engagement analytics</li>
                <li>Customize menu appearance and branding</li>
                <li>Collect customer feedback</li>
                <li>Manage multiple restaurant profiles and locations</li>
              </ul>

              <p className="text-gray-700 mt-4">
                We reserve the right to modify, suspend, or discontinue any part of the Service at
                any time with or without notice. We will not be liable to you or any third party for
                any modification, suspension, or discontinuance of the Service.
              </p>
            </div>

            {/* Account Registration */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                3. Account Registration and Security
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    3.1 Account Creation
                  </h3>
                  <p className="text-gray-700">
                    To use certain features of MenuMaster, you must create an account. You agree to:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mt-2">
                    <li>Provide accurate, current, and complete information</li>
                    <li>Maintain and update your information to keep it accurate and current</li>
                    <li>Maintain the security of your password and account</li>
                    <li>Notify us immediately of any unauthorized access or security breach</li>
                    <li>Accept responsibility for all activities under your account</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    3.2 Account Restrictions
                  </h3>
                  <p className="text-gray-700">
                    You may not: (a) share your account with others;
                    (b) use another person's account without permission; or (c) create an account
                    using automated means or false pretenses.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    3.3 Account Termination
                  </h3>
                  <p className="text-gray-700">
                    We reserve the right to suspend or terminate your account at any time for any
                    reason, including violation of these Terms. You may delete your account at any
                    time through your account settings.
                  </p>
                </div>
              </div>
            </div>

            {/* Subscription Plans and Payments */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                4. Subscription Plans and Payments
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    4.1 Subscription Plans
                  </h3>
                  <p className="text-gray-700 mb-2">
                    Qresto offers multiple subscription tiers:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>
                      <strong>Free Plan:</strong> Limited features with restricted usage (1 profile,
                      1 menu, 10 items, 5 scans/day)
                    </li>
                    <li>
                      <strong>Standard Plan:</strong> Enhanced features for 2,500 DZD/month (3 profiles,
                      3 menus, 50 items, 100 scans/day)
                    </li>
                    <li>
                      <strong>Custom Plan:</strong> Unlimited features with custom pricing for
                      enterprise needs
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    4.2 Payment Terms
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Subscriptions are billed monthly in advance</li>
                    <li>All fees are in Algerian Dinars (DZD) unless otherwise stated</li>
                    <li>Payment is processed through our secure payment provider Chargily</li>
                    <li>Accepted payment methods: EDAHABIA, CIB, and other local payment options</li>
                    <li>You authorize us to charge your payment method for recurring subscription fees</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    4.3 Refund Policy
                  </h3>
                  <p className="text-gray-700">
                    All subscription fees are non-refundable except as required by law. If you cancel
                    your subscription, you will continue to have access until the end of your current
                    billing period. No partial refunds will be provided for unused portions of a
                    subscription period.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    4.4 Price Changes
                  </h3>
                  <p className="text-gray-700">
                    We reserve the right to modify our pricing at any time. We will provide at least
                    30 days' notice of any price increases for existing subscribers. Continued use
                    of the Service after a price change constitutes acceptance of the new pricing.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    4.5 Free Trial
                  </h3>
                  <p className="text-gray-700">
                    New users may access certain paid features during a trial period. At the end of
                    the trial, your account will automatically downgrade to the Free Plan unless you
                    subscribe to a paid plan.
                  </p>
                </div>
              </div>
            </div>

            {/* User Content and Responsibilities */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                5. User Content and Responsibilities
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    5.1 Your Content
                  </h3>
                  <p className="text-gray-700">
                    You retain ownership of all content you upload to Qresto, including menu
                    items, descriptions, images, and restaurant information ("User Content"). By
                    uploading User Content, you grant us a worldwide, non-exclusive, royalty-free
                    license to use, store, display, and distribute your User Content solely for the
                    purpose of providing the Service.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    5.2 Content Standards
                  </h3>
                  <p className="text-gray-700 mb-2">You agree that your User Content will not:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Violate any applicable laws or regulations</li>
                    <li>Infringe upon intellectual property rights of others</li>
                    <li>Contain false, misleading, or deceptive information</li>
                    <li>Include offensive, harmful, or inappropriate material</li>
                    <li>Contain malware, viruses, or malicious code</li>
                    <li>Promote illegal activities or products</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    5.3 Menu Accuracy
                  </h3>
                  <p className="text-gray-700">
                    You are solely responsible for ensuring that all menu information (prices,
                    descriptions, ingredients, allergen information) is accurate, current, and
                    compliant with applicable food safety and labeling regulations. Qresto is
                    not liable for any inaccuracies in your menu content.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    5.4 Content Removal
                  </h3>
                  <p className="text-gray-700">
                    We reserve the right to review, monitor, and remove any User Content that
                    violates these Terms or is otherwise objectionable, without prior notice.
                  </p>
                </div>
              </div>
            </div>

            {/* Prohibited Uses */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <XCircle className="w-8 h-8 text-red-500" />
                <h2 className="text-3xl font-bold text-gray-900">6. Prohibited Uses</h2>
              </div>

              <p className="text-gray-700 mb-4">You may not use Qresto to:</p>

              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Violate any local, national, or international laws or regulations</li>
                <li>Transmit or upload malicious code, viruses, or harmful software</li>
                <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
                <li>
                  Reverse engineer, decompile, or attempt to extract source code from our Service
                </li>
                <li>Use automated systems (bots, scrapers) to access the Service</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Collect or harvest user information without consent</li>
                <li>Impersonate another person or entity</li>
                <li>Resell or redistribute the Service without our written permission</li>
                <li>Use the Service for any fraudulent or illegal purpose</li>
              </ul>
            </div>

            {/* Intellectual Property */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                7. Intellectual Property Rights
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    7.1 Qresto Property
                  </h3>
                  <p className="text-gray-700">
                    The Service, including all software, designs, text, graphics, logos, and other
                    content (excluding User Content), is owned by Qresto and protected by
                    copyright, trademark, and other intellectual property laws. You may not copy,
                    modify, distribute, or create derivative works without our express written
                    permission.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    7.2 Trademarks
                  </h3>
                  <p className="text-gray-700">
                    "Qresto" and our logo are trademarks of Qresto. You may not use our
                    trademarks without our prior written consent.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    7.3 Feedback
                  </h3>
                  <p className="text-gray-700">
                    If you provide us with feedback, suggestions, or ideas about the Service, you
                    grant us the right to use such feedback without any obligation or compensation
                    to you.
                  </p>
                </div>
              </div>
            </div>

            {/* Analytics and Data Usage */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                8. Analytics and Data Usage
              </h2>

              <p className="text-gray-700 mb-4">
                Qresto collects analytics data about QR code scans, menu views, and user
                interactions to provide you with insights about your menu performance. You acknowledge
                and agree that:
              </p>

              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>We may collect anonymous usage data from customers who scan your QR codes</li>
                <li>Analytics data is provided "as is" and may not always be 100% accurate</li>
                <li>
                  We may use aggregated, anonymized data for research, improvement, and marketing
                  purposes
                </li>
                <li>You may not use our Service to collect personal data from end-users</li>
              </ul>
            </div>

            {/* Third-Party Services */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                9. Third-Party Services
              </h2>

              <p className="text-gray-700">
                Qresto integrates with third-party services (such as Chargily for payment
                processing). Your use of these third-party services is subject to their respective
                terms and privacy policies. We are not responsible for the actions, policies, or
                content of third-party services. Links to third-party websites are provided for
                convenience only and do not constitute endorsement.
              </p>
            </div>

            {/* Disclaimers */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <AlertCircle className="w-8 h-8 text-yellow-500" />
                <h2 className="text-3xl font-bold text-gray-900">10. Disclaimers</h2>
              </div>

              <div className="space-y-4 bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                <p className="text-gray-700 font-semibold uppercase">
                  THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
                  EITHER EXPRESS OR IMPLIED.
                </p>

                <p className="text-gray-700">
                  Qresto disclaims all warranties, including but not limited to:
                </p>

                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Implied warranties of merchantability and fitness for a particular purpose</li>
                  <li>Warranties regarding accuracy, reliability, or availability of the Service</li>
                  <li>Warranties that the Service will be uninterrupted, secure, or error-free</li>
                  <li>Warranties regarding the accuracy of analytics or data</li>
                </ul>

                <p className="text-gray-700">
                  We do not guarantee that the Service will meet your requirements or that any
                  defects will be corrected. You use the Service at your own risk.
                </p>
              </div>
            </div>

            {/* Limitation of Liability */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                11. Limitation of Liability
              </h2>

              <div className="space-y-4 bg-red-50 rounded-xl p-6 border border-red-200">
                <p className="text-gray-700 font-semibold uppercase">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, QRESTO SHALL NOT BE LIABLE FOR ANY
                  INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.
                </p>

                <p className="text-gray-700">
                  This includes but is not limited to:
                </p>

                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Loss of profits, revenue, or business opportunities</li>
                  <li>Loss of data or information</li>
                  <li>Service interruptions or downtime</li>
                  <li>Personal injury or property damage</li>
                  <li>Errors in menu information or pricing displayed to customers</li>
                  <li>Unauthorized access to your account</li>
                </ul>

                <p className="text-gray-700">
                  Our total liability to you for any claims arising from your use of the Service
                  shall not exceed the amount you paid to us in the 12 months preceding the claim,
                  or 10,000 DZD, whichever is less.
                </p>

                <p className="text-gray-700">
                  Some jurisdictions do not allow the exclusion of certain warranties or limitation
                  of liability, so some of the above limitations may not apply to you.
                </p>
              </div>
            </div>

            {/* Indemnification */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">12. Indemnification</h2>

              <p className="text-gray-700">
                You agree to indemnify, defend, and hold harmless Qresto, its officers,
                directors, employees, and agents from and against any claims, liabilities, damages,
                losses, costs, or expenses (including reasonable attorneys' fees) arising out of or
                relating to:
              </p>

              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-4">
                <li>Your use of the Service</li>
                <li>Your User Content</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any rights of another party</li>
                <li>Any inaccurate or misleading menu information you provide</li>
              </ul>
            </div>

            {/* Dispute Resolution */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                13. Dispute Resolution and Arbitration
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    13.1 Informal Resolution
                  </h3>
                  <p className="text-gray-700">
                    Before filing a claim, you agree to contact us at{" "}
                    <a
                      href="mailto:legal@qresto.com"
                      className="text-orange-500 hover:text-orange-600"
                    >
                      legal@qresto.com
                    </a>{" "}
                    to attempt to resolve the dispute informally.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    13.2 Governing Law
                  </h3>
                  <p className="text-gray-700">
                    These Terms shall be governed by and construed in accordance with the laws of
                    Algeria, without regard to its conflict of law principles.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    13.3 Jurisdiction
                  </h3>
                  <p className="text-gray-700">
                    Any disputes arising from these Terms or your use of the Service shall be
                    subject to the exclusive jurisdiction of the courts located in Algiers, Algeria.
                  </p>
                </div>
              </div>
            </div>

            {/* Termination */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">14. Termination</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    14.1 Termination by You
                  </h3>
                  <p className="text-gray-700">
                    You may terminate your account at any time by contacting us or using the account
                    deletion option in your settings. Upon termination, your right to use the Service
                    will immediately cease.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    14.2 Termination by Us
                  </h3>
                  <p className="text-gray-700">
                    We may suspend or terminate your account immediately if:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mt-2">
                    <li>You violate these Terms</li>
                    <li>Your payment fails or you have outstanding fees</li>
                    <li>We suspect fraudulent or illegal activity</li>
                    <li>We discontinue the Service (with 30 days' notice)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    14.3 Effect of Termination
                  </h3>
                  <p className="text-gray-700">
                    Upon termination, all licenses and rights granted to you will immediately cease.
                    We may delete your User Content within 30 days of termination. Sections that by
                    their nature should survive (including payment obligations, disclaimers, and
                    limitations of liability) will remain in effect after termination.
                  </p>
                </div>
              </div>
            </div>

            {/* General Provisions */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">15. General Provisions</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    15.1 Entire Agreement
                  </h3>
                  <p className="text-gray-700">
                    These Terms, together with our Privacy Policy, constitute the entire agreement
                    between you and Qresto regarding the Service.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    15.2 Modifications to Terms
                  </h3>
                  <p className="text-gray-700">
                    We reserve the right to modify these Terms at any time. We will notify you of
                    material changes by email or through the Service. Continued use of the Service
                    after changes constitutes acceptance of the modified Terms.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">15.3 Severability</h3>
                  <p className="text-gray-700">
                    If any provision of these Terms is found to be invalid or unenforceable, the
                    remaining provisions will remain in full force and effect.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">15.4 Waiver</h3>
                  <p className="text-gray-700">
                    Our failure to enforce any provision of these Terms shall not be deemed a waiver
                    of that provision or any other provision.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">15.5 Assignment</h3>
                  <p className="text-gray-700">
                    You may not assign or transfer these Terms or your account without our written
                    consent. We may assign these Terms without restriction.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    15.6 Force Majeure
                  </h3>
                  <p className="text-gray-700">
                    Qresto shall not be liable for any failure to perform due to circumstances
                    beyond our reasonable control, including acts of God, natural disasters, war,
                    terrorism, pandemics, or government actions.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-orange-50 rounded-xl p-8 border border-orange-200">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-8 h-8 text-orange-500" />
                <h2 className="text-3xl font-bold text-gray-900">16. Contact Information</h2>
              </div>

              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>

              <div className="space-y-2 text-gray-700">
                <p>
                  <strong>Email:</strong>{" "}
                  <a
                    href="mailto:legal@qresto.com"
                    className="text-orange-500 hover:text-orange-600"
                  >
                    legal@qresto.com
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
                  <strong>Address:</strong> Qresto, Algiers, Algeria
                </p>
              </div>

              <div className="mt-6 p-4 bg-white rounded-lg">
                <p className="text-gray-700 text-sm">
                  By using Qresto, you acknowledge that you have read, understood, and agree to
                  be bound by these Terms of Service.
                </p>
              </div>
            </div>
          </div>

          {/* Related Links */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">Related Legal Documents</p>
            <div className="flex justify-center gap-4">
              <Link
                href="/legal/privacy"
                className="text-orange-500 hover:text-orange-600 font-medium"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
