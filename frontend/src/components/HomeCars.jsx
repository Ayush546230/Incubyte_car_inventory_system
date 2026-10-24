// src/components/Home.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Users, Fuel, Gauge, CheckCircle, Zap } from "lucide-react";
import axios from "axios";
import { homeCarsStyles as styles } from "../assets/dummyStyles";
import { getRealisticRupeePrice } from "./CarDetail";
import { API_BASE, buildImageSrc as sharedBuildImageSrc } from "../config/api";



const HomeCars = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [animateCards, setAnimateCards] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const abortRef = useRef(null);

  const api = axios.create({
    baseURL: API_BASE,
    headers: { Accept: "application/json" },
  });
  const limit = 6;
  const fallbackImage = `${API_BASE}/uploads/default-car.png`;

  useEffect(() => {
    const t = setTimeout(() => setAnimateCards(true), 300);
    fetchCars();
    return () => {
      clearTimeout(t);
      try {
        abortRef.current?.abort();
      } catch { }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCars = async () => {
    setLoading(true);
    setError("");
    try {
      abortRef.current?.abort();
    } catch { }
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const res = await api.get("/api/vehicles", {
        params: { limit },
        signal: ctrl.signal,
      });
      setCars(res.data?.data || res.data?.vehicles || []);
    } catch (err) {
      const isCanceled =
        err?.code === "ERR_CANCELED" ||
        err?.name === "CanceledError" ||
        err?.message === "canceled";
      if (!isCanceled) {
        console.error("Error fetching cars:", err);
        setError(
          err?.response?.data?.message || err.message || "Failed to load cars"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const buildImageSrc = (image) => {
    if (!image) return "";
    if (Array.isArray(image)) image = image[0];
    if (typeof image !== "string") return "";
    return sharedBuildImageSrc(image);
  };

  const handleImageError = (e) => {
    const img = e?.target;
    if (!img) return;
    img.onerror = null;
    img.src = fallbackImage;
    img.onerror = () => {
      img.onerror = null;
      img.src = "https://via.placeholder.com/400x250.png?text=No+Image";
    };
    img.alt = img.alt || "Image not available";
    img.style.objectFit = img.style.objectFit || "cover";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const opts =
        d.getFullYear() === now.getFullYear()
          ? { day: "numeric", month: "short" }
          : { day: "numeric", month: "short", year: "numeric" };
      return new Intl.DateTimeFormat("en-IN", opts).format(d);
    } catch {
      return dateStr;
    }
  };

  const isBookDisabled = (car) => {
    const qty = car.quantity !== undefined ? Number(car.quantity) : 5;
    return qty <= 0 || car.status === "sold_out";
  };

  const handleBook = (car) => {
    if (isBookDisabled(car)) return;
    const rawPrice = car.price !== undefined ? Number(car.price) : (car.dailyRate ? car.dailyRate * 500 : 25000);
    const realisticPrice = getRealisticRupeePrice(car.make, car.model, rawPrice);
    navigate(`/cars/${car._id || car.id}`, { state: { car: { ...car, price: realisticPrice } } });
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <div className={styles.premiumBadge}>
          <Zap className="w-4 h-4 text-amber-400 mr-2" />
          <span className={styles.premiumText}>Premium Fleet Selection</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
          <div className="w-full text-center">
            <h1 className={styles.title}>Luxury Car Collection</h1>
            <p className={styles.subtitle}>
              Discover premium vehicles with exceptional performance and comfort
              for your next journey
            </p>
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        {loading &&
          Array.from({ length: limit }).map((_, idx) => (
            <div
              key={`s-${idx}`}
              className={`${styles.card} border ${styles.borderGradients?.[
                idx % (styles.borderGradients?.length || 1)
                ] || ""
                } opacity-50 animate-pulse`}
              style={{
                clipPath:
                  "polygon(0% 15%, 15% 0%, 100% 0%, 100% 85%, 85% 100%, 0% 100%)",
              }}
            >
              <div className={styles.borderOverlay}></div>
              <div className={styles.imageContainer}>
                <div className="w-full h-full bg-gray-200" />
              </div>
              <div className={styles.content}>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
                <div className="grid grid-cols-4 gap-2">
                  <div className="h-8 bg-gray-200 rounded" />
                  <div className="h-8 bg-gray-200 rounded" />
                  <div className="h-8 bg-gray-200 rounded" />
                  <div className="h-8 bg-gray-200 rounded" />
                </div>
                <div className="h-10 bg-gray-200 rounded mt-4" />
              </div>
              <div className={styles.accentBlur}></div>
            </div>
          ))}

        {!loading && error && (
          <div className="col-span-full text-center text-red-600">{error}</div>
        )}
        {!loading && !error && cars.length === 0 && (
          <div className="col-span-full text-center">No cars found.</div>
        )}

        {!loading &&
          cars.map((car, idx) => {
            const carName =
              `${car.make || ""} ${car.model || ""}`.trim() ||
              car.name ||
              "Unnamed";
            const patternStyle =
              styles.cardPatterns && styles.cardPatterns.length
                ? styles.cardPatterns[idx % styles.cardPatterns.length]
                : "";
            const borderStyle =
              styles.borderGradients && styles.borderGradients.length
                ? styles.borderGradients[idx % styles.borderGradients.length]
                : "";
            const imageSrc = buildImageSrc(car.image) || fallbackImage;
            const transitionDelay = `${idx * 100}ms`;
            const initialTranslateY = "40px";
            const transformWhenHovered =
              hoveredCard === (car._id || car.id) ? "rotate(0.5deg)" : "none";
            const disabled = isBookDisabled(car);

            return (
              <div
                key={car._id || car.id || idx}
                onMouseEnter={() => setHoveredCard(car._id || car.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`${styles.card} ${patternStyle} border ${borderStyle} hover:shadow-2xl hover:-translate-y-3`}
                style={{
                  clipPath:
                    "polygon(0% 15%, 15% 0%, 100% 0%, 100% 85%, 85% 100%, 0% 100%)",
                  transformStyle: "preserve-3d",
                  transform: animateCards
                    ? transformWhenHovered
                    : `translateY(${initialTranslateY})`,
                  opacity: animateCards ? 1 : 0,
                  transition: `transform 420ms cubic-bezier(.2,.8,.2,1), opacity 420ms ease`,
                  transitionDelay,
                }}
              >
                <div className={styles.borderOverlay}></div>

                <div className={styles.priceBadge}>
                  <span className={styles.priceText}>
                    ₹{getRealisticRupeePrice(car.make, car.model, Number(car.price || (car.dailyRate ? car.dailyRate * 500 : 25000))).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="absolute right-4 top-4 z-20">
                  {(car.quantity !== undefined ? car.quantity : 5) <= 0 ? (
                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-950/90 text-red-400 border border-red-600/50 shadow-md">
                      Out of Stock
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-950/90 text-emerald-400 border border-emerald-500/50 shadow-md">
                      In Stock: {car.quantity !== undefined ? car.quantity : 5}
                    </span>
                  )}
                </div>

                <div className={styles.imageContainer}>
                  <img
                    src={imageSrc}
                    alt={carName}
                    onError={handleImageError}
                    className="w-full h-full object-cover transition-transform duration-500"
                    style={{
                      transform:
                        hoveredCard === (car._id || car.id)
                          ? "rotate(0.5deg)"
                          : "scale(1) rotate(0)",
                    }}
                  />
                </div>

                <div className={styles.content}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className={styles.carName}>{carName}</h3>
                      <p className={styles.carInfoContainer}>
                        <span className={styles.carTypeBadge}>
                          {car.category || "Sedan"}
                        </span>
                        <span className={styles.carYear}>
                          {car.year || "—"}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className={styles.specsGrid}>
                    {[
                      { icon: Users, value: car.seats || "4", label: "Seats" },
                      {
                        icon: Fuel,
                        value: car.fuelType || "Gasoline",
                        label: "Fuel",
                      },
                      {
                        icon: Gauge,
                        value: car.mileage ? `${car.mileage} kmpl` : "—",
                        label: "Mileage",
                      },
                      {
                        icon: CheckCircle,
                        value: car.transmission || "Auto",
                        label: "Trans",
                      },
                    ].map((spec, i) => (
                      <div key={i} className={styles.specItem}>
                        <div
                          className={styles.specIconContainer(
                            hoveredCard === (car._id || car.id)
                          )}
                        >
                          <spec.icon
                            className={styles.specIcon(
                              hoveredCard === (car._id || car.id)
                            )}
                          />
                        </div>
                        <span className={styles.specValue}>{spec.value}</span>
                        <span className={styles.specLabel}>{spec.label}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      const id = car._id || car.id;
                      navigate(`/cars/${id}`, { state: { car } });
                    }}
                    className={`${styles.bookButton} ${(car.quantity !== undefined ? car.quantity : 5) <= 0
                        ? "opacity-60 cursor-not-allowed bg-gray-800 text-gray-500"
                        : "hover:shadow-md cursor-pointer"
                      }`}
                    disabled={(car.quantity !== undefined ? car.quantity : 5) <= 0}
                    title={
                      (car.quantity !== undefined ? car.quantity : 5) <= 0
                        ? "Vehicle is out of stock"
                        : "View details & purchase"
                    }
                  >
                    <span className={styles.buttonText}>
                      {(car.quantity !== undefined ? car.quantity : 5) <= 0
                        ? "Out of Stock"
                        : "Purchase Vehicle"}
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                </div>

                <div className={styles.accentBlur}></div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default HomeCars;