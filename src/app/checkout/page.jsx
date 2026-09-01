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
} from "@tabler/icons-react";
import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
  const {
    items,
    subtotal,
    discount,
    vatIncluded,
    total,
    promoCode,
    activePromoDetails,
    clearCart,
    isMounted,
  } = useCart();

  // Delivery method choice
  const [shippingMethod, setShippingMethod] = useState("standard"); // 'standard' | 'white-glove'
  const shippingCost = shippingMethod === "white-glove" ? 49 : 0;
  const finalTotal = total + shippingCost;

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
              </div>

              {/* Step 3: Shipping Method Selection */}
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
                  {/* Standard Option */}
                  <label
                    className={`flex items-center justify-between p-4 border cursor-pointer transition-all ${
                      shippingMethod === "standard"
                        ? "border-wbk-black bg-[#FBF9F8] shadow-xs"
                        : "border-wbk-lightgrey bg-white hover:border-wbk-brown"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shippingOption"
                        checked={shippingMethod === "standard"}
                        onChange={() => setShippingMethod("standard")}
                        className="accent-wbk-black"
                      />
                      <div>
                        <span className="block text-xs font-semibold text-wbk-black">
                          Standard UK Mainland Delivery
                        </span>
                        <span className="block text-[11px] text-wbk-brown">
                          Direct dispatched with tracking (3–5 working days)
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-wbk-green uppercase tracking-wider">
                      Free
                    </span>
                  </label>

                  {/* White Glove Option */}
                  <label
                    className={`flex items-center justify-between p-4 border cursor-pointer transition-all ${
                      shippingMethod === "white-glove"
                        ? "border-wbk-black bg-[#FBF9F8] shadow-xs"
                        : "border-wbk-lightgrey bg-white hover:border-wbk-brown"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shippingOption"
                        checked={shippingMethod === "white-glove"}
                        onChange={() => setShippingMethod("white-glove")}
                        className="accent-wbk-black"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-wbk-black">
                            White Glove Room of Choice Service
                          </span>
                          <span className="px-1.5 py-0.2 text-[9px] font-semibold bg-wbk-gold text-wbk-black uppercase">
                            Recommended
                          </span>
                        </div>
                        <span className="block text-[11px] text-wbk-brown">
                          Carried directly into your room of choice + packaging removal
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-wbk-black font-poppins">
                      £49.00
                    </span>
                  </label>
                </div>
              </div>

              {/* Step 4: Payment Simulation */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-wbk-lightgrey/80">
                  <h2 className="font-new-york text-xl text-wbk-black flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-wbk-black text-white text-xs flex items-center justify-center font-poppins">
                      4
                    </span>
                    <span>Payment Method</span>
                  </h2>
                </div>

                <div className="space-y-3">
                  {/* Payment method selector tabs */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleChange("paymentMethod", "card")}
                      className={`p-3 text-center border text-xs font-medium transition-all ${
                        formData.paymentMethod === "card"
                          ? "border-wbk-black bg-[#FBF9F8] font-semibold text-wbk-black"
                          : "border-wbk-lightgrey bg-white text-wbk-brown hover:border-wbk-black"
                      }`}
                    >
                      <IconCreditCard size={18} className="mx-auto mb-1" />
                      <span>Credit Card</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleChange("paymentMethod", "klarna")}
                      className={`p-3 text-center border text-xs font-medium transition-all ${
                        formData.paymentMethod === "klarna"
                          ? "border-wbk-black bg-[#FBF9F8] font-semibold text-wbk-black"
                          : "border-wbk-lightgrey bg-white text-wbk-brown hover:border-wbk-black"
                      }`}
                    >
                      <span className="block font-bold text-xs mb-1 text-pink-600">Klarna.</span>
                      <span>Pay in 3</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleChange("paymentMethod", "paypal")}
                      className={`p-3 text-center border text-xs font-medium transition-all ${
                        formData.paymentMethod === "paypal"
                          ? "border-wbk-black bg-[#FBF9F8] font-semibold text-wbk-black"
                          : "border-wbk-lightgrey bg-white text-wbk-brown hover:border-wbk-black"
                      }`}
                    >
                      <span className="block font-bold text-xs mb-1 text-blue-600">PayPal</span>
                      <span>Express</span>
                    </button>
                  </div>

                  {/* Card Details Box */}
                  {formData.paymentMethod === "card" && (
                    <div className="p-4 sm:p-6 bg-[#FBF9F8] border border-wbk-lightgrey space-y-4">
                      <div>
                        <label
                          htmlFor="cardNumber"
                          className="block text-[11px] font-medium uppercase tracking-wider text-wbk-black mb-1"
                        >
                          Card Number
                        </label>
                        <input
                          id="cardNumber"
                          type="text"
                          maxLength={19}
                          placeholder="4532 •••• •••• 8921"
                          value={formData.cardNumber}
                          onChange={(e) => handleChange("cardNumber", e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs border border-wbk-lightgrey bg-white focus:border-wbk-black focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div>
                          <label
                            htmlFor="cardExpiry"
                            className="block text-[11px] font-medium uppercase tracking-wider text-wbk-black mb-1"
                          >
                            Expiry
                          </label>
                          <input
                            id="cardExpiry"
                            type="text"
                            maxLength={5}
                            placeholder="MM/YY"
                            value={formData.cardExpiry}
                            onChange={(e) => handleChange("cardExpiry", e.target.value)}
                            className="w-full px-3.5 py-2.5 text-xs border border-wbk-lightgrey bg-white focus:border-wbk-black focus:outline-none"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="cardCvc"
                            className="block text-[11px] font-medium uppercase tracking-wider text-wbk-black mb-1"
                          >
                            CVC
                          </label>
                          <input
                            id="cardCvc"
                            type="text"
                            maxLength={4}
                            placeholder="123"
                            value={formData.cardCvc}
                            onChange={(e) => handleChange("cardCvc", e.target.value)}
                            className="w-full px-3.5 py-2.5 text-xs border border-wbk-lightgrey bg-white focus:border-wbk-black focus:outline-none"
                          />
                        </div>

                        <div className="col-span-2 sm:col-span-1">
                          <label
                            htmlFor="cardName"
                            className="block text-[11px] font-medium uppercase tracking-wider text-wbk-black mb-1"
                          >
                            Name on Card
                          </label>
                          <input
                            id="cardName"
                            type="text"
                            placeholder="J SMITH"
                            value={formData.cardName}
                            onChange={(e) => handleChange("cardName", e.target.value)}
                            className="w-full px-3.5 py-2.5 text-xs border border-wbk-lightgrey bg-white focus:border-wbk-black focus:outline-none uppercase"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Klarna Description */}
                  {formData.paymentMethod === "klarna" && (
                    <div className="p-5 bg-pink-50/50 border border-pink-200 text-xs text-wbk-black space-y-1.5">
                      <span className="font-semibold text-pink-700 block">
                        Split your purchase into 3 interest-free payments:
                      </span>
                      <p className="text-[11px] text-wbk-brown">
                        Pay £{(finalTotal / 3).toFixed(2)} today, and the rest in two automatic monthly payments with 0% interest and no fees when paid on time.
                      </p>
                    </div>
                  )}

                  {/* PayPal Description */}
                  {formData.paymentMethod === "paypal" && (
                    <div className="p-5 bg-blue-50/50 border border-blue-200 text-xs text-wbk-black">
                      <p className="text-[11px] text-wbk-brown">
                        After clicking "Complete Order", you will be safely redirected to PayPal to complete your purchase using your PayPal balance or linked bank card.
                      </p>
                    </div>
                  )}
                </div>

                {/* Error message */}
                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700">
                    {errorMessage}
                  </div>
                )}

                {/* Terms agreement checkbox */}
                <div className="pt-3">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-wbk-brown">
                    <input
                      type="checkbox"
                      checked={formData.agreeTerms}
                      onChange={(e) => handleChange("agreeTerms", e.target.checked)}
                      className="accent-wbk-black mt-0.5"
                    />
                    <span>
                      I agree to the{" "}
                      <Link href="/terms" className="text-wbk-black underline">
                        Terms and Conditions
                      </Link>{" "}
                      and acknowledge the{" "}
                      <Link href="/privacy" className="text-wbk-black underline">
                        Privacy Policy
                      </Link>
                      .
                    </span>
                  </label>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-wbk-black text-white hover:bg-wbk-green hover:text-wbk-black text-xs font-semibold uppercase tracking-[0.16em] transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  <IconLock size={16} />
                  <span>
                    {isSubmitting
                      ? "Processing Secure Payment..."
                      : `Pay £${finalTotal.toLocaleString()} & Complete Order`}
                  </span>
                </button>
              </div>
            </div>

            {/* Right Column: Order Summary (5 cols) */}
            <div className="lg:col-span-5 sticky top-20 space-y-6">
              <div className="bg-[#FBF9F8] border border-wbk-lightgrey p-6 sm:p-8 space-y-6">
                <h3 className="font-new-york text-xl text-wbk-black pb-3 border-b border-wbk-lightgrey">
                  Order Summary ({items.length})
                </h3>

                {/* Mini Item List */}
                <div className="space-y-4 divide-y divide-wbk-lightgrey/50 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="pt-3 first:pt-0 flex gap-3 items-center">
                      <div className="relative w-14 h-14 bg-white border border-wbk-lightgrey/60 shrink-0 p-1 flex items-center justify-center">
                        <Image
                          src={item.image || "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp"}
                          alt={item.title}
                          fill
                          sizes="56px"
                          className="object-contain p-1"
                        />
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-wbk-black text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-medium text-wbk-black truncate">
                          {item.title}
                        </h4>
                        <p className="text-[10.5px] text-wbk-brown truncate">
                          {item.options?.size || "Standard"} {item.options?.orientation ? `• ${item.options.orientation}` : ""}
                        </p>
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
                      {shippingCost === 0 ? "Free UK Delivery" : "£49.00 (White Glove)"}
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
