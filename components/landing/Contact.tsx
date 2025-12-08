// @ts-nocheck
"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      // TODO: Replace with actual API call to /api/contact
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSubmitStatus({
        type: "success",
        message: "✓ Thank you! We'll get back to you soon.",
      });
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      className="py-20 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden"
      id="contact"
    >
      {/* Decorative blobs */}
      <div className="absolute -top-10 -right-10 w-96 h-96 bg-orange-100/40 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
              💬 Contact Us
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Get in Touch
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and
            we’ll respond as soon as possible.
          </p>
        </div>

        {/* Single centered form (no right-side cards) */}
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* subtle glow border */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-200/60 via-white to-blue-200/60 rounded-3xl blur-xl opacity-70" />

            <div className="relative bg-white/90 backdrop-blur rounded-3xl shadow-2xl border border-gray-100 p-6 sm:p-8 md:p-10">
              {/* Form header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Send className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Send us a Message
                    </h3>
                    <p className="text-sm text-gray-500">
                      We typically reply within a few hours.
                    </p>
                  </div>
                </div>

                {/* trust chips */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-700">
                    No spam
                  </span>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-700">
                    Fast support
                  </span>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-700">
                    Human replies
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Inputs grid */}
                <div className="grid sm:grid-cols-2 gap-5">
                  {/* Name */}
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-gray-700"
                    >
                      Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white
                                   focus:border-orange-500 focus:ring-4 focus:ring-orange-100 
                                   outline-none transition-all shadow-sm hover:border-gray-300"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-gray-700"
                    >
                      Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@gmail.com"
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white
                                   focus:border-orange-500 focus:ring-4 focus:ring-orange-100 
                                   outline-none transition-all shadow-sm hover:border-gray-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help..."
                    rows={6}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white
                               focus:border-orange-500 focus:ring-4 focus:ring-orange-100 
                               outline-none transition-all resize-none shadow-sm hover:border-gray-300"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white
                             px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-2
                             transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>

                {/* Status */}
                {submitStatus.type && (
                  <div
                    className={`p-4 rounded-xl border-2 text-sm font-medium ${
                      submitStatus.type === "success"
                        ? "bg-green-50 text-green-800 border-green-200"
                        : "bg-red-50 text-red-800 border-red-200"
                    }`}
                  >
                    {submitStatus.message}
                  </div>
                )}
              </form>

              {/* tiny footer note */}
              <p className="mt-6 text-xs text-gray-500 text-center">
                By submitting, you agree to be contacted about your request.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
