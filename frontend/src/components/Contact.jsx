import React, { useState } from "react";
import { contactPageStyles as styles } from "../assets/dummyStyles";
import {
  FaCalendarAlt,
  FaCar,
  FaClock,
  FaEnvelope,
  FaMapMarkedAlt,
  FaPhone,
  FaUser,
  FaWhatsapp,
  FaExternalLinkAlt,
  FaComment,
} from "react-icons/fa";
import { IoIosSend } from "react-icons/io";
import { toast, ToastContainer } from "react-toastify";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    carType: "",
    message: "",
  });
  const [activeField, setActiveField] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFocus = (field) => {
    setActiveField(field);
  };

  const handleBlur = () => {
    setActiveField(null);
  };

  // Handler for sending message via WhatsApp
  const handleSendWhatsApp = (e) => {
    if (e) e.preventDefault();
    const name = formData.name.trim() || "Customer";
    const email = formData.email.trim() || "N/A";
    const phone = formData.phone.trim() || "N/A";
    const carType = formData.carType || "All Vehicle Types";
    const userMsg =
      formData.message.trim() ||
      "I am interested in purchasing a vehicle from RYDEX Dealership. Please share available models and delivery options.";

    const text = encodeURIComponent(
      `Hello RYDEX Dealership Team,\n\n` +
      `I am submitting an enquiry via your website:\n` +
      `• Customer Name: ${name}\n` +
      `• Email Address: ${email}\n` +
      `• Contact Phone: ${phone}\n` +
      `• Vehicle Preference: ${carType}\n\n` +
      `Enquiry Message:\n${userMsg}\n\n` +
      `Thank you!`
    );

    window.open(`https://wa.me/919304049070?text=${text}`, "_blank");
    toast.success("Opening WhatsApp chat with your enquiry message...", {
      autoClose: 2000,
    });
  };

  // Handler for sending message via Email
  const handleSendEmail = (e) => {
    if (e) e.preventDefault();
    const name = formData.name.trim() || "Customer";
    const phone = formData.phone.trim() || "N/A";
    const carType = formData.carType || "Vehicle Purchase";
    const userMsg =
      formData.message.trim() ||
      "I am interested in purchasing a vehicle from your showroom. Please contact me with quotation and delivery details.";

    const subject = encodeURIComponent(
      `Dealership Vehicle Enquiry: ${carType} - ${name}`
    );
    const body = encodeURIComponent(
      `Hello RYDEX Team,\n\n` +
      `I am writing to inquire about purchasing a vehicle:\n\n` +
      `• Full Name: ${name}\n` +
      `• Contact Email: ${formData.email.trim() || "N/A"}\n` +
      `• Phone Number: ${phone}\n` +
      `• Preferred Vehicle Type: ${carType}\n\n` +
      `Message:\n${userMsg}\n\n` +
      `Best regards,\n${name}`
    );

    window.location.href = `mailto:ayushsrivastava18623@gmail.com?subject=${subject}&body=${body}`;
    toast.success("Opening your email client to send enquiry...", {
      autoClose: 2000,
    });
  };

  return (
    <div className={styles.container}>
      <ToastContainer position="top-right" theme="dark" />
      <div className={styles.diamondPattern}>
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
            linear-gradient(30deg, rgba(249,115,22,0.08) 12%, transparent 12.5%, transparent 87%, rgba(249,115,22,0.08) 87.5%, rgba(249,115,22,0.08)),
            linear-gradient(150deg, rgba(249,115,22,0.08) 12%, transparent 12.5%, transparent 87%, rgba(249,115,22,0.08) 87.5%, rgba(249,115,22,0.08)),
            linear-gradient(30deg, rgba(249,115,22,0.08) 12%, transparent 12.5%, transparent 87%, rgba(249,115,22,0.08) 87.5%, rgba(249,115,22,0.08)),
            linear-gradient(150deg, rgba(249,115,22,0.08) 12%, transparent 12.5%, transparent 87%, rgba(249,115,22,0.08) 87.5%, rgba(249,115,22,0.08)),
            linear-gradient(60deg, rgba(234,88,12,0.08) 25%, transparent 25.5%, transparent 75%, rgba(234,88,12,0.08) 75%, rgba(234,88,12,0.08)),
            linear-gradient(60deg, rgba(234,88,12,0.08) 25%, transparent 25.5%, transparent 75%, rgba(234,88,12,0.08) 75%, rgba(234,88,12,0.08))`,
            backgroundSize: "80px 140px",
            backgroundPosition:
              "0 0, 0 0, 40px 70px, 40px 70px, 0 0, 40px 70px",
          }}
        ></div>
      </div>
      <div className={styles.floatingTriangles}>
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className={styles.triangle}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
              background:
                i % 3 === 0 ? "#f97316" : i % 3 === 1 ? "#fb923c" : "#fdba74",
              transform: `rotate(${Math.random() * 360}deg) scale(${Math.random() * 0.5 + 0.5
                })`,
            }}
          ></div>
        ))}
      </div>

      <div className={styles.content}>
        <div className={styles.titleContainer}>
          <h1 className={styles.title}>Contact Our Team</h1>
          <div className={styles.divider} />
          <p className={styles.subtitle}>
            Have questions about our premium vehicle inventory? Our team is ready to assist
            with your vehicle purchase and doorstep delivery.
          </p>
        </div>

        <div className={styles.cardContainer}>
          {/* Left Column: Interactive Contact Channels */}
          <div className={styles.infoCard}>
            <div className={styles.infoCardCircle1}></div>
            <div className={styles.infoCardCircle2}></div>
            <div className="relative z-10 space-y-5">
              <h2 className={styles.infoTitle}>
                <FaMapMarkedAlt className={styles.infoIcon} />
                Our Information
              </h2>

              <div className={styles.infoItemContainer}>
                {/* Clickable WhatsApp Card */}
                <a
                  href="https://wa.me/919304049070?text=Hello%20RYDEX%20Dealership%20Team%2C%20I%20am%20interested%20in%20purchasing%20a%20vehicle.%20Please%20share%20details."
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.infoItem} hover:border-emerald-500/60 border border-slate-700/60 transition-all cursor-pointer group shadow-sm hover:shadow-emerald-950/40`}
                  title="Click to open WhatsApp chat with our team"
                >
                  <div
                    className={styles.iconContainer(
                      "bg-emerald-950/80 border border-emerald-700/50 group-hover:scale-110 transition-transform"
                    )}
                  >
                    <FaWhatsapp className="text-emerald-400 text-xl" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className={styles.infoLabel}>WhatsApp Support</h3>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/40 flex items-center gap-1">
                        Chat Now <FaExternalLinkAlt className="text-[8px]" />
                      </span>
                    </div>
                    <p className="text-white font-mono text-sm mt-0.5 font-bold">
                      +91 9304049070
                    </p>
                    <span className="text-[11px] text-emerald-300/80 block mt-0.5">
                      Click to chat directly on WhatsApp
                    </span>
                  </div>
                </a>

                {/* Clickable Email Card */}
                <a
                  href="mailto:ayushsrivastava18623@gmail.com?subject=Dealership%20Vehicle%20Purchase%20Enquiry&body=Hello%20RYDEX%20Team%2C%0A%0AI%20am%20interested%20in%20purchasing%20a%20vehicle%20from%20your%20dealership.%20Please%20provide%20more%20information.%0A%0AThank%20you!"
                  className={`${styles.infoItem} hover:border-cyan-500/60 border border-slate-700/60 transition-all cursor-pointer group shadow-sm hover:shadow-cyan-950/40`}
                  title="Click to open email client and message our team"
                >
                  <div
                    className={styles.iconContainer(
                      "bg-cyan-950/80 border border-cyan-700/50 group-hover:scale-110 transition-transform"
                    )}
                  >
                    <FaEnvelope className="text-cyan-400 text-xl" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <h3 className={styles.infoLabel}>Official Email</h3>
                      <span className="text-[10px] text-cyan-400 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/40 flex items-center gap-1">
                        Send Mail <FaExternalLinkAlt className="text-[8px]" />
                      </span>
                    </div>
                    <p className="text-white font-mono text-xs sm:text-sm mt-0.5 truncate font-semibold">
                      ayushsrivastava18623@gmail.com
                    </p>
                    <span className="text-[11px] text-cyan-300/80 block mt-0.5">
                      Click to send email directly
                    </span>
                  </div>
                </a>

                {/* Showroom Operating Hours */}
                <div className={styles.infoItem}>
                  <div
                    className={styles.iconContainer(
                      "bg-slate-800/80 border border-slate-700/50"
                    )}
                  >
                    <FaClock className="text-cyan-400 text-xl" />
                  </div>
                  <div>
                    <h3 className={styles.infoLabel}>Showroom Hours</h3>
                    <p className="text-white text-xs sm:text-sm mt-0.5">
                      Mon - Sat: 8:00 AM - 8:00 PM
                    </p>
                    <span className="block text-gray-400 text-[11px]">
                      Sunday: 10:00 AM - 6:00 PM
                    </span>
                  </div>
                </div>
              </div>

              {/* Dealership Benefits Banner */}
              <div className={styles.offerContainer}>
                <div className="flex items-center">
                  <FaCalendarAlt className={styles.offerIcon} />
                  <span className={styles.offerTitle}>Dealership Privilege</span>
                </div>
                <p className={styles.offerText}>
                  1-Year Comprehensive Warranty, RTO Paperwork Assistance & Express Doorstep Delivery included on all vehicle purchases.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Send Enquiry Form */}
          <div className={styles.formCard}>
            <div className={styles.formCircle1}></div>
            <div className={styles.formCircle2}></div>
            <div className="mb-4">
              <h2 className={styles.formTitle}>
                <IoIosSend className={styles.infoIcon} />
                Send Your Enquiry
              </h2>
              <p className={styles.formSubtitle}>
                Fill out the form below and click either button to message us via WhatsApp or Email.
              </p>
            </div>

            <form onSubmit={handleSendWhatsApp} className={styles.form}>
              <div className={styles.formGrid}>
                {["name", "email", "phone", "carType"].map((field) => {
                  const icons = {
                    name: FaUser,
                    email: FaEnvelope,
                    phone: FaPhone,
                    carType: FaCar,
                  };

                  const placeholders = {
                    name: "Full Name",
                    email: "Email Address",
                    phone: "Phone Number",
                    carType: "Select Vehicle Type",
                  };

                  return (
                    <div key={field} className={styles.inputContainer}>
                      <div className={styles.inputIcon}>
                        {React.createElement(icons[field])}
                      </div>
                      {field !== "carType" ? (
                        <input
                          type={
                            field === "email"
                              ? "email"
                              : field === "phone"
                                ? "tel"
                                : "text"
                          }
                          name={field}
                          value={formData[field]}
                          onChange={handleChange}
                          onFocus={() => handleFocus(field)}
                          onBlur={handleBlur}
                          placeholder={placeholders[field]}
                          className={styles.input(activeField === field)}
                        />
                      ) : (
                        <select
                          name="carType"
                          value={formData.carType}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          onFocus={() => handleFocus(field)}
                          className={styles.select(activeField === field)}
                        >
                          <option value="">Select Vehicle Type</option>
                          {[
                            "Luxury Sedan",
                            "Sports SUV",
                            "Electric Vehicle",
                            "Supercar / Coupe",
                            "Off-road 4x4",
                            "Executive Limousine",
                          ].map((opt) => (
                            <option
                              value={opt}
                              key={opt}
                              className="bg-gray-800 cursor-pointer"
                            >
                              {opt}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="relative">
                <div className={styles.textareaIcon}>
                  <FaComment />
                </div>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  onFocus={() => handleFocus("message")}
                  onBlur={handleBlur}
                  rows="3"
                  placeholder="Tell us about your vehicle requirements, model preferences, or delivery location..."
                  className={styles.textarea(activeField === "message")}
                ></textarea>
              </div>

              {/* Functional Dual Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="w-full cursor-pointer flex items-center justify-center gap-2.5 py-3 px-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 rounded-xl text-white font-bold text-sm shadow-lg shadow-emerald-950/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <FaWhatsapp className="text-xl" />
                  <span>Send via WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendEmail}
                  className="w-full cursor-pointer flex items-center justify-center gap-2.5 py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl text-white font-bold text-sm shadow-lg shadow-cyan-950/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <FaEnvelope className="text-base" />
                  <span>Send via Email</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { 
          from { opacity:0; transform:translateY(10px);} 
          to { opacity:1; transform:translateY(0);} 
        }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default Contact;
