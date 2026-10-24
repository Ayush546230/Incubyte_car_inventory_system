// src/components/Navbar.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaTimes, FaUser, FaSignOutAlt, FaShieldAlt } from "react-icons/fa";
import logo from "../assets/logocar.png";
import { navbarStyles as styles } from "../assets/dummyStyles";
import axios from "axios";
import { API_BASE } from "../config/api";

const ME_ENDPOINT = "/api/auth/me";
const LOGOUT_ENDPOINT = "/api/auth/logout";

const api = axios.create({
  baseURL: API_BASE,
  headers: { Accept: "application/json" },
});

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => !!localStorage.getItem("token")
  );
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(
    () => !!localStorage.getItem("adminToken")
  );
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [scrolled, setScrolled] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const abortRef = useRef(null);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/cars", label: "Cars" },
    { to: "/contact", label: "Contact" },
    { to: "/purchases", label: "My Purchases" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
      setIsScrolling(true);

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 500);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const validateToken = useCallback(
    async (signal) => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoggedIn(false);
        setUser(null);
        return;
      }

      try {
        const res = await api.get(ME_ENDPOINT, {
          signal,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const profile = res?.data?.user ?? res?.data ?? null;
        if (profile) {
          setIsLoggedIn(true);
          setUser(profile);
          try {
            localStorage.setItem("user", JSON.stringify(profile));
          } catch { }
        } else {
          setIsLoggedIn(true);
          setUser(null);
        }
      } catch (err) {
        if (
          axios.isAxiosError(err) &&
          err.response &&
          err.response.status === 401
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setIsLoggedIn(false);
          setUser(null);
        } else {
          // Keep existing cached user on network delay or offline
          try {
            const raw = localStorage.getItem("user");
            if (raw) setUser(JSON.parse(raw));
          } catch { }
        }
      }
    },
    []
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoggedIn(false);
      setUser(null);
      return;
    }

    if (abortRef.current) {
      try {
        abortRef.current.abort();
      } catch { }
    }
    const controller = new AbortController();
    abortRef.current = controller;
    validateToken(controller.signal);

    return () => {
      try {
        controller.abort();
      } catch { }
      abortRef.current = null;
    };
  }, [location.pathname, validateToken]);

  useEffect(() => {
    const handleStorageChange = (ev) => {
      if (ev.key === "token" || ev.key === "user" || ev.key === "adminToken") {
        setIsAdminLoggedIn(!!localStorage.getItem("adminToken"));
        if (abortRef.current) {
          try {
            abortRef.current.abort();
          } catch { }
        }
        const controller = new AbortController();
        abortRef.current = controller;
        validateToken(controller.signal);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [validateToken]);

  const handleLogout = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await api.post(
          LOGOUT_ENDPOINT,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 2000,
          }
        );
      } catch { }
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    setIsOpen(false);

    navigate("/", { replace: true });
  }, [navigate]);

  useEffect(() => {
    setIsOpen(false);
    setIsLoggedIn(!!localStorage.getItem("token"));
    setIsAdminLoggedIn(!!localStorage.getItem("adminToken"));
    try {
      const raw = localStorage.getItem("user");
      setUser(raw ? JSON.parse(raw) : null);
    } catch {
      setUser(null);
    }
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && isOpen) setIsOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    if (path === "/purchases") {
      return (
        location.pathname === "/purchases" ||
        location.pathname === "/my-purchases" ||
        location.pathname === "/bookings"
      );
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      className={`${styles.nav.base} ${scrolled ? styles.nav.scrolled : styles.nav.notScrolled
        }`}
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div
            className={`w-full rounded-full transition-all duration-300 ease-out ${isScrolling
                ? "bg-white/65 backdrop-blur-xl shadow-2xl border border-cyan-400/60 ring-2 ring-cyan-400/20 scale-[0.995]"
                : scrolled
                  ? "bg-white/95 backdrop-blur-none shadow-lg border border-gray-200 scale-100"
                  : "bg-white/95 backdrop-blur-none shadow-md border border-gray-200 scale-100"
              } ${scrolled
                ? styles.floatingNav.scrolled
                : styles.floatingNav.notScrolled
              }`}
            role="region"
            aria-roledescription="navigation"
          >
            <div className="flex items-center justify-between gap-4">
              <Link to="/" className="flex items-center">
                <div className={styles.logoContainer}>
                  <img
                    src={logo}
                    alt="RYDEX logo"
                    className="h-[1em] w-auto block"
                    style={{ display: "block", objectFit: "contain" }}
                  />
                  <span className={styles.logoText}>RYDEX</span>
                </div>
              </Link>

              <div className={styles.navLinksContainer}>
                <div className={styles.navLinksInner}>
                  {navLinks.map((link, index) => (
                    <React.Fragment key={link.to}>
                      <Link
                        to={link.to}
                        className={`${styles.navLink.base} ${isActive(link.to)
                            ? styles.navLink.active
                            : styles.navLink.inactive
                          }`}
                      >
                        {link.label}
                      </Link>

                      {index < navLinks.length - 1 && (
                        <div className={styles.separator} aria-hidden="true" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className={styles.userActions}>
                {/* Admin button next to User Login */}
                {isAdminLoggedIn ? (
                  <Link
                    to="/admin/manage-cars"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-cyan-600 bg-cyan-50 hover:bg-cyan-100 border border-cyan-300 shadow-sm transition-all"
                    title="Access Admin Panel"
                  >
                    <FaShieldAlt className="text-xs text-cyan-600" />
                    <span>Admin Panel</span>
                  </Link>
                ) : (
                  <Link
                    to="/admin/login"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-gray-700 hover:text-cyan-600 bg-gray-100/90 hover:bg-cyan-50 border border-gray-300 hover:border-cyan-300 shadow-sm transition-all"
                    title="Administrator Login"
                  >
                    <FaShieldAlt className="text-xs text-cyan-500" />
                    <span>Admin Login</span>
                  </Link>
                )}

                {isLoggedIn ? (
                  <button
                    onClick={handleLogout}
                    className={styles.authButton}
                    aria-label="Logout"
                    title={user?.name || "Logout"}
                  >
                    <FaSignOutAlt className="text-base" />
                    <span className={styles.authText}>Logout</span>
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className={styles.authButton}
                    aria-label="Login"
                  >
                    <FaUser className="text-base" />
                    <span className={styles.authText}>Login</span>
                  </Link>
                )}
              </div>

              <div className="md:hidden flex items-center">
                <button
                  ref={buttonRef}
                  onClick={() => setIsOpen((p) => !p)}
                  className={styles.mobileMenuButton}
                  aria-expanded={isOpen}
                  aria-controls="mobile-menu"
                  aria-label={isOpen ? "Close menu" : "Open menu"}
                >
                  {isOpen ? (
                    <FaTimes className="h-5 w-5" />
                  ) : (
                    <FaBars className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        id="mobile-menu"
        ref={menuRef}
        className={`${styles.mobileMenu.container} ${isOpen ? styles.mobileMenu.open : styles.mobileMenu.closed
          }`}
        aria-hidden={!isOpen}
      >
        <div className={styles.mobileMenuInner}>
          <div className="px-4 pt-3 pb-4 space-y-2">
            <div className={styles.mobileGrid}>
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={`${styles.mobileLink.base} ${isActive(link.to)
                      ? styles.mobileLink.active
                      : styles.mobileLink.inactive
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className={styles.divider} />

            <div className="pt-1 space-y-2">
              {isAdminLoggedIn ? (
                <Link
                  to="/admin/manage-cars"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center px-4 py-3 text-left rounded-lg text-cyan-600 bg-cyan-50 font-bold text-sm transition-colors border border-cyan-200"
                >
                  <FaShieldAlt className="mr-3 text-base text-cyan-600" />
                  Admin Panel
                </Link>
              ) : (
                <Link
                  to="/admin/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center px-4 py-3 text-left rounded-lg text-gray-700 hover:text-cyan-600 hover:bg-gray-50 font-medium text-sm transition-colors border border-gray-200"
                >
                  <FaShieldAlt className="mr-3 text-base text-cyan-500" />
                  Admin Login
                </Link>
              )}

              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className={styles.mobileAuthButton}
                >
                  <FaSignOutAlt className="mr-3 text-base" />
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className={styles.mobileAuthButton}
                >
                  <FaUser className="mr-3 text-base" />
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;