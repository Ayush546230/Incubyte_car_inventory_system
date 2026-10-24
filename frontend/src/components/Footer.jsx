import React from "react";
import { footerStyles as styles } from "../assets/dummyStyles";
import { Link } from "react-router-dom";
import logo from "../assets/logocar.png";
import {
  FaEnvelope,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaMapMarkedAlt,
  FaPhone,
  FaTwitter,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa";
import { GiCarKey } from "react-icons/gi";

const Footer = () => {
  return (
    <footer className={styles.container}>
      <div className={styles.topElements}>
        <div className={styles.circle1} />
        <div className={styles.circle2} />
        <div className={styles.roadLine} />
      </div>
      <div className={styles.innerContainer}>
        <div className={styles.grid}>
          <div className={styles.brandSection}>
            <Link to={"/"} className="flex items-center">
              <div className={styles.logoContainer}>
                <img
                  src={logo}
                  alt="logo"
                  className="h-[1em] w-auto block"
                  style={{ display: "block", objectFit: "contain" }}
                />
                <span className={styles.logoText}>RYDEX</span>
              </div>
            </Link>
            <p className={styles.description}>
              Authorized vehicle dealership offering premium certified automobiles,
              seamless purchasing, and verified doorstep delivery. Drive your dream car today!
            </p>
            <div className={styles.socialIcons}>
              {[
                FaFacebookF,
                FaTwitter,
                FaInstagram,
                FaLinkedinIn,
                FaYoutube,
              ].map((Icon, i) => (
                <a href="#" key={i} className={styles.socialIcon}>
                  <Icon />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h3 className={styles.sectionTitle}>
              Quick Links
              <span className={styles.underline} />
            </h3>
            <ul className={styles.linkList}>
              {["Home", "Cars", "Contact Us"].map((link, i) => (
                <li key={i}>
                  <a
                    href={
                      link === "Home"
                        ? "/"
                        : link === "Contact Us"
                          ? "/contact"
                          : "/cars"
                    }
                    className={styles.linkItem}
                  >
                    <span className={styles.bullet}></span>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className={styles.sectionTitle}>
              Contact Us <span className={styles.underline} />
            </h3>
            <ul className={styles.contactList}>
              <li className={styles.contactItem}>
                <FaMapMarkedAlt className={styles.contactItem} />
                <span>111 Park Avenue, Manipal, KA 5613</span>
              </li>
              <li className={styles.contactItem}>
                <FaPhone className={styles.contactItem} />
                <a href="tel:+919304049070" className="hover:text-amber-400 transition-colors">
                  +91 9304049070
                </a>
              </li>
              <li className={styles.contactItem}>
                <FaWhatsapp className="text-emerald-400 text-base" />
                <a
                  href="https://wa.me/919304049070?text=Hello%20RYDEX%20Team%2C%20I%20am%20interested%20in%20purchasing%20a%20vehicle."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors"
                >
                  WhatsApp Chat
                </a>
              </li>
              <li className={styles.contactItem}>
                <FaEnvelope className={styles.contactItem} />
                <a
                  href="mailto:ayushsrivastava18623@gmail.com?subject=Dealership%20Vehicle%20Enquiry"
                  className="hover:text-cyan-400 transition-colors truncate"
                >
                  ayushsrivastava18623@gmail.com
                </a>
              </li>
            </ul>
            <div className={styles.hoursContainer}>
              <h4 className={styles.hoursTitle}>Business Hours</h4>
              <div className={styles.hoursText}>
                <p>Monday - Friday: 8:00 AM - 8:00 PM</p>
                <p>Saturday: 9:00 AM - 6:00 PM</p>
                <p>Sunday: 10:00 AM - 4:00 PM</p>
              </div>
            </div>
          </div>
          <div>
            <h3 className={styles.sectionTitle}>Newsletter <span className={styles.underline}></span></h3>
            <p className={styles.newsletterText}>Subscribe for special offers and updates</p>
            <form className="space-y-3">
              <input type="email" placeholder="Your Email Address" className={styles.input} />
              <button type="submit" className={styles.subscribeButton}>
                <GiCarKey className="mr-2 text-lg sm:text-xl" />Subscribe Now
              </button>
            </form>
          </div>
        </div>

        <div className={styles.copyright}>
          <p>&copy; {new Date().getFullYear()} RYDEX. All rights reserved.</p>
          <p className="mt-3 md:mt-0">Designed by Ayush</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
