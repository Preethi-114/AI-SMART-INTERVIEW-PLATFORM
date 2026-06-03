import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  /* ================= SCROLL EFFECT ================= */
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ================= ACTIVE SECTION ================= */
  useEffect(() => {
    const sections = ["hero", "overview", "features", "workflow", "tech", "stats"];

    const handleScroll = () => {
      const scrollPos = window.scrollY + 120;

      sections.forEach((id) => {
        const section = document.getElementById(id);
        if (
          section &&
          scrollPos >= section.offsetTop &&
          scrollPos < section.offsetTop + section.offsetHeight
        ) {
          setActiveSection(id);
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ================= SMOOTH OFFSET SCROLL ================= */
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (!element) return;

    const headerOffset = 90;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition =
      elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });

    setActiveSection(id);

    // Close mobile menu
    const nav = document.getElementById("navbarNav");
    if (nav?.classList.contains("show")) {
      nav.classList.remove("show");
    }
  };

  return (
    <>
      {/* Header Navigation */}
      <header
        className={`fixed-top ${
          scrolled ? "bg-white shadow-sm py-2" : "bg-white py-3"
        } transition-all`}
        style={{ zIndex: 1030 }}
      >
        <div className="container">
          <nav className="navbar navbar-expand-lg p-0">
            {/* Logo */}
            <div className="navbar-brand d-flex align-items-center">
              <div className="bg-gradient-primary rounded-3 p-2 me-2">
                <i className="bi bi-brain  text-white fs-4"></i>
              </div>
              <span className="fs-3 fw-bold text-dark">AI INTERVIEW</span>
              <span className="badge bg-primary ms-2">Pro</span>
            </div>

            {/* Desktop Menu */}
            <div className="collapse navbar-collapse" id="navbarNav">
              <div className="navbar-nav ms-auto">
                {["overview", "features", "workflow", "tech", "stats"].map(
                  (section) => (
                    <button
                      key={section}
                      className={`nav-link mx-2 ${
                        activeSection === section
                          ? "text-primary fw-bold"
                          : "text-secondary"
                      }`}
                      onClick={() => scrollToSection(section)}
                    >
                      {section.charAt(0).toUpperCase() + section.slice(1)}
                    </button>
                  )
                )}
              </div>

              <div className="d-flex gap-2 ms-3">
                <button
                  onClick={() => navigate("/login")}
                  className="btn btn-outline-primary"
                >
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Login
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="btn btn-primary"
                >
                  <i className="bi bi-person-plus me-2"></i>
                  Get Started
                </button>
              </div>
            </div>

            {/* Mobile Toggle */}
            <button
              className="navbar-toggler border-0"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <i className="bi bi-list fs-3"></i>
            </button>
          </nav>
        </div>
      </header>

      {/* Header Styles */}
      <style jsx>{`
        .bg-gradient-primary {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        }
        .transition-all {
          transition: all 0.3s ease;
        }
      `}</style>
    </>
  );
}
