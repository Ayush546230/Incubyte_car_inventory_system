// frontend/src/admin/AdminNavbar.jsx
import React, { useEffect, useRef, useState } from "react";
import { navbarStyles as s } from "./adminStyles";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logocar.png";
import {
  CalendarCheck,
  Car,
  Menu,
  PlusCircle,
  X,
  ExternalLink,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { toast } from "react-toastify";

const navLinks = [
  { path: "/admin/add-car", icon: PlusCircle, label: "Add Vehicle" },
  { path: "/admin/manage-cars", icon: Car, label: "Manage Inventory" },
  { path: "/admin/bookings", icon: CalendarCheck, label: "Bookings & Orders" },
];

const AdminNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
      setIsScrolling(true);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 500);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const onDocClick = (e) => {
      if (
        isOpen &&
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(e.target) &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [isOpen]);

  const handleAdminLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    toast.info("Logged out from Admin Dashboard", {
      theme: "colored",
      autoClose: 1500,
    });
    navigate("/admin/login", { replace: true });
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className={s.navbar(scrolled)}>
      <div className={s.navbarInner}>
        <div className={s.navbarCenter}>
          <div
            className={`w-full rounded-full transition-all duration-300 ease-out border ${
              isScrolling
                ? "bg-white/65 backdrop-blur-xl shadow-2xl border-cyan-400/60 ring-2 ring-cyan-400/20 scale-[0.995]"
                : scrolled
                ? "bg-white/95 backdrop-blur-none shadow-lg border-gray-200 scale-100"
                : "bg-white/95 backdrop-blur-none shadow-md border-gray-200 scale-100"
            } ${scrolled ? "py-2 px-4 sm:px-6" : "py-2.5 sm:py-3 px-5 sm:px-8"}`}
          >
            <div className={s.contentContainer}>
              {/* Brand Logo & Admin Badge */}
              <Link to="/admin/manage-cars" className={s.logoLink}>
                <div className={s.logoContainer}>
                  <img
                    src={logo}
                    alt="Logo"
                    className={s.logoImage}
                    style={{ objectFit: "contain" }}
                  />
                  <span className={s.logoText}>
                    RYDEX
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-600 text-white flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> ADMIN
                    </span>
                  </span>
                </div>
              </Link>

              {/* Desktop Nav Links */}
              <div className={s.desktopNav}>
                <div className={s.navLinksContainer}>
                  {navLinks.map((link, i) => {
                    const Icon = link.icon;
                    const active = isActive(link.path);
                    return (
                      <React.Fragment key={link.path}>
                        <Link
                          to={link.path}
                          className={active ? s.navLinkActive : s.navLink}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{link.label}</span>
                        </Link>
                        {i < navLinks.length - 1 && (
                          <div className={s.navDivider} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Actions: View Store & Admin Logout */}
              <div className="hidden lg:flex items-center gap-3">
                <Link
                  to="/"
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:text-cyan-600 hover:border-cyan-400 hover:bg-cyan-50 transition-all"
                  title="View Customer Site"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Customer View</span>
                </Link>

                <button
                  onClick={handleAdminLogout}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-all cursor-pointer"
                  title="Logout from Admin"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>

              {/* Mobile Menu Button */}
              <div className={s.mobileMenuButton}>
                <button
                  ref={buttonRef}
                  onClick={() => setIsOpen((v) => !v)}
                  className={s.menuButton}
                  aria-label="Toggle Menu"
                  aria-expanded={isOpen}
                >
                  {isOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div ref={menuRef} className={s.mobileMenu}>
          <div className={s.mobileMenuContainer}>
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={active ? s.mobileNavLinkActive : s.mobileNavLink}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            <div className="border-t border-gray-200 my-2 pt-2 space-y-2">
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-cyan-600" />
                <span>Customer View (Website)</span>
              </Link>
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleAdminLogout();
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Admin Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNavbar;
