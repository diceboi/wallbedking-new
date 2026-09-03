"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import {
  IconLock,
  IconArrowLeft,
  IconTruck,
  IconCreditCard,
  IconShieldCheck,
  IconCheck,
  IconChevronRight,
  IconSparkles,
  IconPrinter,
  IconBrandPaypal,
} from "@tabler/icons-react";
import { useCart } from "@/context/CartContext";
import { StripeCheckoutButton } from "@/components/checkout/StripeCheckoutButton";
import { PayPalCheckoutButton } from "@/components/checkout/PayPalCheckoutButton";

export default function CheckoutPage() {
  const {
    items,
    subtotal,
    discount,
    vatIncluded,
    shipping,
    total,
    deliveryOption,
    setDeliveryOption,
    deliveryOptions,
    selectedDeliveryDetails,
    promoCode,
    activePromoDetails,
    clearCart,
    isMounted,
  } = useCart();

  const finalTotal = total;

  // Form states
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    city: "",
    postcode: "",
    country: "United Kingdom",
    paymentMethod: "card", // 'card' | 'klarna' | 'paypal'
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    cardName: "",
    agreeTerms: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    setErrorMessage("");

    // Basic validation
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.address1 || !formData.city || !formData.postcode) {
      setErrorMessage("Please complete all required shipping address fields.");
      return;
    }

    if (formData.paymentMethod === "card") {
      if (!formData.cardNumber || !formData.cardExpiry || !formData.cardCvc) {
        setErrorMessage("Please enter your card details to complete payment.");
        return;
      }
    }

    setIsSubmitting(true);

    // Simulate order payment processing
    setTimeout(() => {
      const generatedOrderNum = "WBK-" + Math.floor(100000 + Math.random() * 900000);
      setOrderNumber(generatedOrderNum);
      setIsSubmitting(false);
      setOrderComplete(true);
      clearCart();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 1200);
  };

  if (!isMounted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center font-poppins text-sm text-wbk-brown">
        Loading checkout...
      </div>
    );
  }

  // If order is completed, show Thank You / Confirmation Screen
  if (orderComplete) {
    return (
      <div className="bg-wbk-white min-h-screen font-poppins py-16">
        <Container size="md" className="max-w-2xl text-center space-y-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-wbk-green/20 text-wbk-black flex items-center justify-center">
            <IconCheck size={40} className="text-wbk-green" strokeWidth={2.5} />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-wbk-gold block">
              Order Confirmed
            </span>
            <h1 className="font-new-york text-3xl sm:text-4xl text-wbk-black">
              Thank you for your order, {formData.firstName}!
            </h1>
            <p className="text-sm text-wbk-brown max-w-md mx-auto leading-relaxed">
              We have received your order and our dispatch team is preparing your precision-engineered wall bed.
            </p>
          </div>

          {/* Order Details Card */}
          <div className="bg-[#FBF9F8] border border-wbk-lightgrey p-6 sm:p-8 text-left space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-wbk-lightgrey">
              <div>
                <span className="text-[11px] text-wbk-brown uppercase tracking-wider block">
                  Order Reference
                </span>
                <span className="font-bold text-lg text-wbk-black font-poppins">
                  {orderNumber}
                </span>
              </div>
              <div className="sm:text-right">
                <span className="text-[11px] text-wbk-brown uppercase tracking-wider block">
                  Confirmation Sent To
                </span>
                <span className="text-xs font-medium text-wbk-black">
                  {formData.email}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-wbk-brown">
              <div>
                <h4 className="font-semibold uppercase tracking-wider text-wbk-black text-[11px] mb-1.5">
                  Delivery Address
                </h4>
                <p className="text-wbk-black font-medium">
                  {formData.firstName} {formData.lastName}
                </p>
                <p>{formData.address1}</p>
                {formData.address2 && <p>{formData.address2}</p>}
                <p>
                  {formData.city}, {formData.postcode}
                </p>
                <p>{formData.country}</p>
                <p className="pt-1">Tel: {formData.phone || "Not provided"}</p>
              </div>

              <div>
                <h4 className="font-semibold uppercase tracking-wider text-wbk-black text-[11px] mb-1.5">
                  Shipping & Service
                </h4>
                <p className="text-wbk-black font-medium">
                  {shippingMethod === "white-glove"
                    ? "White Glove Room of Choice Delivery"
                    : "Standard UK Mainland Delivery (3–5 days)"}
                </p>
                <p className="pt-2 text-[11px] leading-relaxed">
                  Our courier will contact you 24 hours prior to dispatch with an exact 2-hour delivery window.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-wbk-lightgrey flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-wider text-wbk-black">
                Total Paid
              </span>
              <span className="font-bold text-xl text-wbk-black font-poppins">
                £{finalTotal.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={() => window.print()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-wbk-lightgrey bg-white text-xs font-medium uppercase tracking-wider text-wbk-black hover:border-wbk-black transition-colors"
            >
              <IconPrinter size={15} />
              <span>Print Receipt</span>
            </button>
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 bg-wbk-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-wbk-green hover:text-wbk-black transition-colors"
            >
              Return to Homepage
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  // If cart is empty and not completed order
  if (items.length === 0) {
    return (
      <div className="bg-wbk-white min-h-[60vh] flex flex-col items-center justify-center text-center font-poppins py-20 px-4">
        <h2 className="font-new-york text-2xl text-wbk-black mb-2">
          Your basket is empty
        </h2>
        <p className="text-xs text-wbk-brown max-w-sm mb-6">
          Please add a wall bed or accessory to your basket before proceeding to checkout.
        </p>
        <Link
          href="/products/beds"
          className="px-6 py-3 bg-wbk-black text-white text-xs font-medium uppercase tracking-wider hover:bg-wbk-green hover:text-wbk-black transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-wbk-white min-h-screen font-poppins pb-24">
      {/* Minimal Checkout Header */}
      <header className="border-b border-wbk-lightgrey bg-[#FBF9F8] py-4">
        <Container size="xl" className="flex items-center justify-between">
          <Link
            href="/cart"
            className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-wbk-brown hover:text-wbk-black transition-colors"
          >
            <IconArrowLeft size={16} />
            <span>Return to Basket</span>
          </Link>

          <Link href="/" className="font-new-york text-xl sm:text-2xl text-wbk-black">
            WallBedKing
          </Link>

          <div className="flex items-center gap-1.5 text-xs text-wbk-brown">
            <IconLock size={14} className="text-wbk-green" />
            <span className="hidden sm:inline font-medium">256-Bit SSL Secure Checkout</span>
          </div>
        </Container>
      </header>

      {/* Main Checkout Form Layout */}
      <Container size="xl" className="pt-8 sm:pt-12">
        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-16 items-start">
            {/* Left Column: Checkout Steps (7 cols) */}
            <div className="lg:col-span-7 space-y-10">
              {/* Step 1: Customer Contact */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-wbk-lightgrey/80">
                  <h2 className="font-new-york text-xl text-wbk-black flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-wbk-black text-white text-xs flex items-center justify-center font-poppins">
                      1
                    </span>
                    <span>Contact Information</span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="email"
                      className="block text-xs font-medium uppercase tracking-wider text-wbk-black mb-1"
                    >
                      Email Address *
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="e.g. john.smith@example.com"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs border border-wbk-lightgrey focus:border-wbk-black focus:outline-none bg-white transition-colors"
                    />
                    <span className="text-[10.5px] text-wbk-brown mt-1 block">
                      We'll send your invoice, dimensions guide, and tracking link here.
                    </span>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="phone"
                      className="block text-xs font-medium uppercase tracking-wider text-wbk-black mb-1"
                    >
                      Mobile Phone Number *
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      placeholder="e.g. 07123 456789"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs border border-wbk-lightgrey focus:border-wbk-black focus:outline-none bg-white transition-colors"
                    />
                    <span className="text-[10.5px] text-wbk-brown mt-1 block">
                      For courier delivery scheduling SMS notifications.
                    </span>
                  </div>
                </div>
              </div>

              {/* Step 2: Shipping Address */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-wbk-lightgrey/80">
                  <h2 className="font-new-york text-xl text-wbk-black flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-wbk-black text-white text-xs flex items-center justify-center font-poppins">
                      2
                    </span>
                    <span>Delivery Address</span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block font-medium uppercase tracking-wider text-wbk-black mb-1"
                    >
                      First Name *
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => handleChange("firstName", e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-wbk-lightgrey focus:border-wbk-black focus:outline-none bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="block font-medium uppercase tracking-wider text-wbk-black mb-1"
                    >
                      Last Name *
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-wbk-lightgrey focus:border-wbk-black focus:outline-none bg-white transition-colors"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="address1"
                      className="block font-medium uppercase tracking-wider text-wbk-black mb-1"
                    >
                      Address Line 1 *
                    </label>
                    <input
                      id="address1"
                      type="text"
                      required
                      placeholder="House name / number and street"
                      value={formData.address1}
                      onChange={(e) => handleChange("address1", e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-wbk-lightgrey focus:border-wbk-black focus:outline-none bg-white transition-colors"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="address2"
                      className="block font-medium uppercase tracking-wider text-wbk-black mb-1"
                    >
                      Address Line 2 (Optional)
                    </label>
                    <input
                      id="address2"
                      type="text"
                      placeholder="Apartment, suite, unit, building floor"
                      value={formData.address2}
                      onChange={(e) => handleChange("address2", e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-wbk-lightgrey focus:border-wbk-black focus:outline-none bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="city"
                      className="block font-medium uppercase tracking-wider text-wbk-black mb-1"
                    >
                      Town / City *
                    </label>
                    <input
                      id="city"
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-wbk-lightgrey focus:border-wbk-black focus:outline-none bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="postcode"
                      className="block font-medium uppercase tracking-wider text-wbk-black mb-1"
                    >
                      Postcode *
                    </label>
                    <input
                      id="postcode"
                      type="text"
                      required
                      placeholder="e.g. SW1A 1AA"
                      value={formData.postcode}
                      onChange={(e) => handleChange("postcode", e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-wbk-lightgrey focus:border-wbk-black focus:outline-none bg-white uppercase transition-colors"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="country"
                      className="block font-medium uppercase tracking-wider text-wbk-black mb-1"
                    >
                      Country
                    </label>
                    <select
                      id="country"
                      value={formData.country}
                      onChange={(e) => handleChange("country", e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-wbk-lightgrey focus:border-wbk-black focus:outline-none bg-white transition-colors"
                    >
                      <option value="United Kingdom">United Kingdom (Free UK Delivery)</option>
                      <option value="Isle of Man">Isle of Man</option>
                      <option value="Channel Islands">Channel Islands</option>
                      <option value="Ireland">Republic of Ireland</option>
                    </select>
                  </div>
                </div>
              </div>              {/* Step 3: Shipping Method Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-wbk-lightgrey/80">
                  <h2 className="font-new-york text-xl text-wbk-black flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-wbk-black text-white text-xs flex items-center justify-center font-poppins">
                      3
                    </span>
                    <span>Shipping Method</span>
                  </h2>
                </div>

                <div className="space-y-3">
                  {Object.values(deliveryOptions).map((opt) => {
                    const isSelected = deliveryOption === opt.id;
                    return (
                      <label
                        key={opt.id}
                        onClick={() => setDeliveryOption(opt.id)}
                        className={`flex items-start justify-between p-4 border cursor-pointer transition-all ${
                          isSelected
                            ? "border-wbk-black bg-[#FBF9F8] shadow-xs"
                            : "border-wbk-lightgrey bg-white hover:border-wbk-brown"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="shippingOption"
                            checked={isSelected}
                            onChange={() => setDeliveryOption(opt.id)}
                            className="mt-0.5 accent-wbk-black cursor-pointer"
                          />
                          <div>
                            <span className="block text-xs font-semibold text-wbk-black">
                              {opt.label}
                            </span>
                            <span className="block text-[11px] text-wbk-brown mt-0.5">
                              {opt.message}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`text-xs font-bold uppercase tracking-wider shrink-0 ml-2 ${
                            opt.cost === 0 ? "text-wbk-green" : "text-wbk-black font-poppins"
                          }`}
                        >
                          {opt.cost === 0 ? "Free" : `£${opt.cost}.00`}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Step 4: Secure Payment */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-wbk-lightgrey/80">
                  <h2 className="font-new-york text-xl text-wbk-black flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-wbk-black text-white text-xs flex items-center justify-center font-poppins">
                      4
                    </span>
                    <span>Secure Payment</span>
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Payment method selector tabs */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleChange("paymentMethod", "card")}
                      className={`p-3 text-center border text-xs font-medium transition-all cursor-pointer ${
                        formData.paymentMethod === "card"
                          ? "border-wbk-black bg-[#FBF9F8] font-semibold text-wbk-black shadow-xs"
                          : "border-wbk-lightgrey bg-white text-wbk-brown hover:border-wbk-black"
                      }`}
                    >
                      <IconCreditCard size={20} className="mx-auto mb-1 text-wbk-black" />
                      <span className="block">Credit / Debit Card</span>
                      <span className="text-[10px] text-wbk-brown font-normal">Stripe & Apple Pay</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleChange("paymentMethod", "paypal")}
                      className={`p-3 text-center border text-xs font-medium transition-all cursor-pointer ${
                        formData.paymentMethod === "paypal"
                          ? "border-wbk-black bg-[#FBF9F8] font-semibold text-wbk-black shadow-xs"
                          : "border-wbk-lightgrey bg-white text-wbk-brown hover:border-wbk-black"
                      }`}
                    >
                      <IconBrandPaypal size={20} className="mx-auto mb-1 text-[#003087]" />
                      <span className="block font-semibold text-[#003087]">PayPal</span>
                      <span className="text-[10px] text-wbk-brown font-normal">Express & Pay in 3</span>
                    </button>
                  </div>

                  {/* Stripe Payment Box */}
                  {formData.paymentMethod === "card" && (
                    <div className="p-6 bg-[#FBF9F8] border border-wbk-lightgrey space-y-4">
                      <div className="flex items-center justify-between text-xs text-wbk-black border-b border-wbk-lightgrey pb-3">
                        <div className="flex items-center gap-2 font-semibold">
                          <IconLock size={16} className="text-wbk-green" />
                          <span>Direct Stripe Checkout</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-wbk-brown font-mono">
                          <span className="px-1.5 py-0.5 bg-white border border-wbk-lightgrey">VISA</span>
                          <span className="px-1.5 py-0.5 bg-white border border-wbk-lightgrey">Mastercard</span>
                          <span className="px-1.5 py-0.5 bg-white border border-wbk-lightgrey">AMEX</span>
                        </div>
                      </div>

                      <p className="text-xs text-wbk-brown leading-relaxed">
                        You will be redirected to Stripe’s secure 256-bit encrypted checkout to complete your transaction with card or Apple Pay.
                      </p>

                      <div className="pt-2">
                        <StripeCheckoutButton label={`Pay £${finalTotal.toLocaleString()} with Stripe`} />
                      </div>
                    </div>
                  )}

                  {/* PayPal Payment Box */}
                  {formData.paymentMethod === "paypal" && (
                    <div className="p-6 bg-[#FBF9F8] border border-wbk-lightgrey space-y-4">
                      <div className="flex items-center justify-between text-xs text-wbk-black border-b border-wbk-lightgrey pb-3">
                        <span className="font-semibold text-wbk-black">PayPal Checkout</span>
                        <span className="text-[10px] text-wbk-brown">Pay with balance, card, or Pay in 3</span>
                      </div>

                      <p className="text-xs text-wbk-brown leading-relaxed">
                        Click the PayPal button below to log into your PayPal account and confirm your payment safely.
                      </p>

                      <div className="pt-2">
                        <PayPalCheckoutButton />
                      </div>
                    </div>
                  )}
                </div>

                {/* Terms agreement */}
                <div className="pt-3 text-[11px] text-wbk-brown leading-relaxed">
                  By confirming payment, you agree to the Wall Bed King{" "}
                  <Link href="/terms" className="text-wbk-black underline hover:text-wbk-green">
                    Terms & Conditions
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-wbk-black underline hover:text-wbk-green">
                    Privacy Policy
                  </Link>
                  .
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary (5 cols) */}
            <div className="lg:col-span-5 sticky top-20 space-y-6">
              <div className="bg-[#FBF9F8] border border-wbk-lightgrey p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-wbk-lightgrey">
                  <h2 className="font-new-york text-xl text-wbk-black">Your Order</h2>
                  <span className="text-xs text-wbk-brown font-poppins">
                    {items.length} {items.length === 1 ? "item" : "items"}
                  </span>
                </div>

                {/* Items List Preview */}
                <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative w-14 h-14 bg-white border border-wbk-lightgrey shrink-0 overflow-hidden">
                        <Image
                          src={item.image || "/sofa1.webp"}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                        <span className="absolute top-0 right-0 bg-wbk-black text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-wbk-black truncate">
                          {item.title}
                        </h4>
                        <span className="text-[11px] text-wbk-brown block truncate">
                          {item.options?.size} {item.options?.orientation && `(${item.options.orientation})`}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-wbk-black font-poppins">
                        £{(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Breakdown */}
                <div className="space-y-2.5 pt-4 border-t border-wbk-lightgrey text-xs text-wbk-brown font-poppins">
                  <div className="flex items-center justify-between">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-wbk-black">
                      £{subtotal.toLocaleString()}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex items-center justify-between text-wbk-green font-medium">
                      <span>Promo Discount ({activePromoDetails?.code})</span>
                      <span>-£{discount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span>Delivery Option</span>
                    <span className="font-semibold text-wbk-black">
                      {shipping === 0 ? "Free Delivery" : `£${shipping}.00 (${selectedDeliveryDetails?.label})`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-wbk-brown/80 pt-1">
                    <span>Includes 20% UK VAT</span>
                    <span>£{vatIncluded.toLocaleString()}</span>
                  </div>
                </div>

                {/* Total */}
                <div className="pt-4 border-t border-wbk-lightgrey flex items-baseline justify-between">
                  <span className="text-sm font-semibold uppercase tracking-wider text-wbk-black">
                    Total Due
                  </span>
                  <span className="font-bold text-2xl text-wbk-black font-poppins">
                    £{finalTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Guarantees Box */}
              <div className="p-6 bg-white border border-wbk-lightgrey space-y-3 text-xs text-wbk-brown">
                <div className="flex items-center gap-2.5">
                  <IconShieldCheck size={18} className="text-wbk-gold shrink-0" />
                  <span className="text-wbk-black font-medium">30-Year Mechanism Guarantee</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <IconTruck size={18} className="text-wbk-green shrink-0" />
                  <span className="text-wbk-black font-medium">Precision Packed & Insured Dispatch</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <IconLock size={16} className="text-wbk-black shrink-0" />
                  <span className="text-wbk-black font-medium">Safe 256-Bit Encrypted Checkout</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Container>
    </div>
  );
}
