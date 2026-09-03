"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import {
  IconPhoneCall,
  IconMail,
  IconClock,
  IconMapPin,
  IconCheck,
  IconSend,
  IconBuildingWarehouse,
  IconCalendarEvent,
} from "@tabler/icons-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "general",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate brief network submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="bg-wbk-white min-h-screen pt-12 pb-24 font-poppins">
      {/* Top Header Section */}
      <section className="border-b border-wbk-lightgrey/60 bg-[#FBF9F8] py-16 sm:py-20">
        <Container size="xl">
          <div className="max-w-3xl">
            <nav className="flex items-center gap-1.5 text-[11px] text-wbk-brown/80 mb-4">
              <Link href="/" className="hover:text-wbk-black transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-wbk-black font-medium">Contact & Showroom</span>
            </nav>

            <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-wbk-gold mb-3">
              We&apos;re Here To Help
            </span>
            <h1 className="font-new-york text-4xl sm:text-5xl md:text-6xl text-wbk-black tracking-tight leading-tight">
              Get in touch with our specialists
            </h1>
            <p className="mt-4 text-sm sm:text-base text-wbk-brown leading-relaxed font-light">
              Have a question about room dimensions, installation requirements, or order delivery?
              Our UK-based wall bed engineering team is on hand 6 days a week to advise you.
            </p>
          </div>
        </Container>
      </section>

      {/* Main Content: Info Cards & Interactive Form */}
      <Container size="xl" className="pt-14 sm:pt-18">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column: Contact Channels & Location Details */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <h2 className="font-new-york text-2xl sm:text-3xl text-wbk-black mb-6">
                Direct Contact Channels
              </h2>
              <div className="space-y-4">
                {/* Telephone */}
                <div className="p-5 rounded-none border border-wbk-lightgrey bg-white flex items-start gap-4 shadow-2xs">
                  <div className="w-10 h-10 rounded-none bg-[#F4F2F0] text-wbk-black flex items-center justify-center shrink-0">
                    <IconPhoneCall size={20} className="text-wbk-gold" />
                  </div>
                  <div>
                    <p className="text-xs uppercase font-semibold tracking-wider text-wbk-brown">
                      Telephone Support
                    </p>
                    <div className="mt-1 flex flex-col gap-1">
                      <a
                        href="tel:08000288940"
                        className="text-sm font-semibold text-wbk-black hover:text-wbk-green transition-colors"
                      >
                        0800 028 8940 <span className="text-xs font-normal text-wbk-brown">(Freephone)</span>
                      </a>
                      <a
                        href="tel:01928583469"
                        className="text-sm font-semibold text-wbk-black hover:text-wbk-green transition-colors"
                      >
                        01928 583 469 <span className="text-xs font-normal text-wbk-brown">(Sales & Orders)</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="p-5 rounded-none border border-wbk-lightgrey bg-white flex items-start gap-4 shadow-2xs">
                  <div className="w-10 h-10 rounded-none bg-[#F4F2F0] text-wbk-black flex items-center justify-center shrink-0">
                    <IconMail size={20} className="text-wbk-gold" />
                  </div>
                  <div>
                    <p className="text-xs uppercase font-semibold tracking-wider text-wbk-brown">
                      Email Inquiries
                    </p>
                    <a
                      href="mailto:support@wallbedking.com"
                      className="mt-1 block text-sm font-semibold text-wbk-black hover:text-wbk-green transition-colors"
                    >
                      support@wallbedking.com
                    </a>
                    <p className="text-[11px] text-wbk-brown mt-0.5">
                      Average response time: within 4–12 business hours
                    </p>
                  </div>
                </div>

                {/* Operating Hours */}
                <div className="p-5 rounded-none border border-wbk-lightgrey bg-white flex items-start gap-4 shadow-2xs">
                  <div className="w-10 h-10 rounded-none bg-[#F4F2F0] text-wbk-black flex items-center justify-center shrink-0">
                    <IconClock size={20} className="text-wbk-gold" />
                  </div>
                  <div>
                    <p className="text-xs uppercase font-semibold tracking-wider text-wbk-brown">
                      Opening Hours
                    </p>
                    <div className="mt-1 text-xs text-wbk-black space-y-0.5">
                      <p>
                        <strong className="font-semibold">Monday – Friday:</strong> 9:00am – 8:00pm
                      </p>
                      <p>
                        <strong className="font-semibold">Saturday:</strong> 9:00am – 12:00pm
                      </p>
                      <p className="text-wbk-brown text-[11px]">Sunday: Closed (Online orders open)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Showroom & Click & Collect Information */}
            <div className="p-6 rounded-none border border-wbk-lightgrey bg-[#FBF9F8] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-none bg-wbk-black text-white flex items-center justify-center shrink-0">
                  <IconBuildingWarehouse size={20} className="text-wbk-gold" />
                </div>
                <div>
                  <h3 className="font-poppins font-semibold text-sm text-wbk-black">
                    Showroom & Warehouse (Appointment Only)
                  </h3>
                  <p className="text-xs text-wbk-brown">Harlow, Essex, CM20 2HU</p>
                </div>
              </div>

              <p className="text-xs text-wbk-brown leading-relaxed">
                Experience our Classic, Studio, and Integrated models in person before ordering.
                Please book an appointment at least 24 hours prior to arrival so a product specialist is
                available to demonstrate mechanisms and guide your selection.
              </p>

              <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-wbk-black">
                <IconCalendarEvent size={16} className="text-wbk-gold" />
                <span>Appointments required for all visits and collections</span>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 sm:p-10 rounded-none border border-wbk-lightgrey shadow-sm">
              <h2 className="font-new-york text-2xl sm:text-3xl text-wbk-black mb-2">
                Send Us a Message
              </h2>
              <p className="text-xs sm:text-sm text-wbk-brown mb-8">
                Fill out the form below and our team will get back to you promptly with answers and technical guidance.
              </p>

              {submitted ? (
                <div className="py-12 px-6 text-center bg-[#F4F2F0]/60 rounded-none border border-wbk-lightgrey/80">
                  <div className="w-12 h-12 bg-wbk-green text-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconCheck size={24} />
                  </div>
                  <h3 className="font-new-york text-2xl text-wbk-black">
                    Thank you for reaching out!
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-wbk-brown max-w-md mx-auto">
                    Your inquiry has been received. One of our specialists will review your message and reply to{" "}
                    <strong className="text-wbk-black">{formData.email}</strong> shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: "", email: "", phone: "", subject: "general", message: "" });
                    }}
                    className="mt-6 px-6 py-2.5 bg-wbk-black text-white text-xs font-medium rounded-full hover:bg-wbk-green transition-colors cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-medium text-wbk-black mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Eleanor Vance"
                        className="w-full h-11 px-4 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none text-wbk-black focus:outline-none focus:border-wbk-black transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-wbk-black mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. eleanor@example.co.uk"
                        className="w-full h-11 px-4 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none text-wbk-black focus:outline-none focus:border-wbk-black transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-medium text-wbk-black mb-1.5">
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g. 07700 900077"
                        className="w-full h-11 px-4 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none text-wbk-black focus:outline-none focus:border-wbk-black transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-wbk-black mb-1.5">
                        Inquiry Topic
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full h-11 px-3 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none text-wbk-black focus:outline-none focus:border-wbk-black transition-colors"
                      >
                        <option value="general">General Sizing & Product Advice</option>
                        <option value="showroom">Showroom Visit Appointment</option>
                        <option value="order">Order Tracking & Delivery Status</option>
                        <option value="assembly">Installation & Technical Assembly</option>
                        <option value="trade">Trade / Commercial Partnership</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-wbk-black mb-1.5">
                      Your Message *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please let us know how we can help, including room dimensions, ceiling height, or bed models you're considering..."
                      className="w-full p-4 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none text-wbk-black focus:outline-none focus:border-wbk-black transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-wbk-black hover:bg-wbk-green text-white text-xs font-semibold uppercase tracking-wider rounded-full transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <IconSend size={15} />
                    <span>{loading ? "Sending..." : "Submit Inquiry"}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </Container>

      {/* Map & Warehouse Location Embed */}
      <section className="mt-20 border-t border-wbk-lightgrey/60 pt-16">
        <Container size="xl">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-wbk-gold">
                Find Us On Google Maps
              </span>
              <h2 className="font-new-york text-2xl sm:text-3xl text-wbk-black mt-1">
                Showroom & Distribution Warehouse
              </h2>
            </div>
            <p className="text-xs text-wbk-brown">
              Harlow, Essex CM20 2HU, United Kingdom • Ample on-site customer parking
            </p>
          </div>

          <div className="w-full aspect-[21/9] min-h-[350px] rounded-none overflow-hidden border border-wbk-lightgrey/80 shadow-xs">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d317584.0005053734!2d-0.130748854027404!3d51.54760679321214!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47d89c0f4d30a9ad%3A0x31b74c31ea10f90e!2sHarlow%2C+Essex+CM20+2HU!5e0!3m2!1sen!2suk!4v1425901328621"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Wall Bed King Showroom Location"
            />
          </div>
        </Container>
      </section>
    </div>
  );
}
