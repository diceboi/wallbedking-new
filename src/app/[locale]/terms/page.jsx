"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";

export default function TermsPage() {
  return (
    <div className="bg-wbk-white min-h-screen pt-12 pb-24 font-poppins">
      {/* Header */}
      <section className="border-b border-wbk-lightgrey/60 bg-[#FBF9F8] py-16 sm:py-20">
        <Container size="xl">
          <div className="max-w-3xl">
            <nav className="flex items-center gap-1.5 text-[11px] text-wbk-brown/80 mb-4">
              <Link href="/" className="hover:text-wbk-black transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-wbk-black font-medium">Terms & Conditions</span>
            </nav>

            <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-wbk-gold mb-3">
              Legal & Purchasing Agreement
            </span>
            <h1 className="font-new-york text-4xl sm:text-5xl md:text-6xl text-wbk-black tracking-tight leading-tight">
              Terms of Service
            </h1>
            <p className="mt-4 text-xs sm:text-sm text-wbk-brown">
              Last updated: January 2026 • Wall Bed King, part of IZN Ltd.
            </p>
          </div>
        </Container>
      </section>

      {/* Content */}
      <Container size="xl" className="pt-14 sm:pt-18">
        <div className="max-w-3xl space-y-10 text-xs sm:text-sm text-wbk-brown leading-relaxed">
          <section className="space-y-3">
            <h2 className="font-new-york text-xl sm:text-2xl text-wbk-black">
              1. Introduction & Company Details
            </h2>
            <p>
              Welcome to Wall Bed King. These Terms and Conditions govern your purchase of products through our website
              and your interactions with Wall Bed King (operated by IZN Ltd). By placing an order, you agree to be bound
              by these terms.
            </p>
            <p>
              Our distribution showroom and warehouse is located in Harlow, Essex, CM20 2HU, United Kingdom.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-new-york text-xl sm:text-2xl text-wbk-black">
              2. Orders, Pricing & Payment
            </h2>
            <p>
              All prices are listed in Pounds Sterling (GBP) and include UK VAT where applicable. We accept all major
              credit and debit cards (Visa, MasterCard, Maestro, American Express) as well as PayPal and PayPal Credit.
            </p>
            <p>
              Payment is processed securely using 256-bit SSL encryption. We reserve the right to decline or cancel an
              order in the event of an obvious pricing error or inventory discrepancy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-new-york text-xl sm:text-2xl text-wbk-black">
              3. 30-Day Money-Back Guarantee & Returns
            </h2>
            <p>
              We are proud of the quality of our wall beds and offer a no-quibble 30-day money-back guarantee.
              If for any reason you are not completely satisfied with your purchase, you may return the items within
              30 calendar days of receipt.
            </p>
            <p>
              • <strong>Refund Amount:</strong> You will receive a full refund of the product purchase price.
              Original or return delivery charges are non-refundable.
            </p>
            <p>
              • <strong>Condition:</strong> Items should be returned in good, saleable condition. Missing or opened
              packaging is not a problem.
            </p>
            <p>
              • <strong>Arranging a Return:</strong> Please contact our support team at{" "}
              <a href="mailto:support@wallbedking.com" className="text-wbk-black underline font-medium">
                support@wallbedking.com
              </a>{" "}
              prior to dispatching any return.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-new-york text-xl sm:text-2xl text-wbk-black">
              4. Lifetime Mechanism Warranty
            </h2>
            <p>
              Wall Bed King provides an unprecedented Lifetime Warranty on all bed frame mechanisms, including the
              heavy-gauge steel chassis, pivot brackets, and gas piston struts against material or manufacturing defects.
            </p>
            <p>
              This warranty does not cover normal wear and tear of wood finishes, damage caused by improper installation,
              exceeding structural load capacities, or unauthorized alterations to the frame.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-new-york text-xl sm:text-2xl text-wbk-black">
              5. Delivery & Inspection
            </h2>
            <p>
              Delivery timeframes depend on the option selected at checkout (Economy, Standard, Express, or Click & Collect).
              While we make every effort to deliver within stated estimates, dates cannot be guaranteed due to carrier
              logistics.
            </p>
            <p>
              Upon delivery, please inspect the packaging cartons for external damage. In the unlikely event that a component
              is damaged during transit, notify our team within 48 hours and we will dispatch replacement parts immediately.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-new-york text-xl sm:text-2xl text-wbk-black">
              6. Governing Law
            </h2>
            <p>
              These Terms and Conditions and any agreements concluded under them shall be governed by and construed in
              accordance with the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction
              of the English courts.
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
}
