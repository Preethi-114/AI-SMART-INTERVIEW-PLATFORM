import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-dark text-white py-5 mt-auto">
      <div className="container">
        <div className="row g-4">
          {/* Company Info */}
          <div className="col-lg-4">
            <div className="d-flex align-items-center mb-3">
              <div className="bg-primary rounded-circle p-2 me-3">
                <i className="fas fa-robot"></i>
              </div>
              <h4 className="fw-bold mb-0">AI Interview Platform</h4>
            </div>
            <p className="text-secondary mb-4">
              Revolutionizing hiring with AI-powered interviews and intelligent candidate evaluation.
            </p>
            <div className="d-flex gap-3">
              <a href="#" className="text-white"><i className="fab fa-twitter"></i></a>
              <a href="#" className="text-white"><i className="fab fa-linkedin"></i></a>
              <a href="#" className="text-white"><i className="fab fa-facebook"></i></a>
              <a href="#" className="text-white"><i className="fab fa-github"></i></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-4">
            <h5 className="fw-bold mb-4">Platform</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/" className="text-secondary text-decoration-none">Home</Link></li>
              <li className="mb-2"><Link to="/features" className="text-secondary text-decoration-none">Features</Link></li>
              <li className="mb-2"><Link to="/pricing" className="text-secondary text-decoration-none">Pricing</Link></li>
              <li className="mb-2"><Link to="/demo" className="text-secondary text-decoration-none">Demo</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="col-lg-2 col-md-4">
            <h5 className="fw-bold mb-4">Resources</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/docs" className="text-secondary text-decoration-none">Documentation</Link></li>
              <li className="mb-2"><Link to="/blog" className="text-secondary text-decoration-none">Blog</Link></li>
              <li className="mb-2"><Link to="/support" className="text-secondary text-decoration-none">Support</Link></li>
              <li className="mb-2"><Link to="/contact" className="text-secondary text-decoration-none">Contact</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-lg-4 col-md-4">
            <h5 className="fw-bold mb-4">Contact Us</h5>
            <ul className="list-unstyled">
              <li className="mb-3">
                <i className="fas fa-map-marker-alt text-primary me-3"></i>
                <span className="text-secondary">123 Tech Street, Silicon Valley</span>
              </li>
              <li className="mb-3">
                <i className="fas fa-phone text-primary me-3"></i>
                <span className="text-secondary">+1 (555) 123-4567</span>
              </li>
              <li className="mb-3">
                <i className="fas fa-envelope text-primary me-3"></i>
                <span className="text-secondary">support@aiinterview.com</span>
              </li>
            </ul>
          </div>
        </div>

        <hr className="my-5 border-secondary" />

        {/* Bottom Footer */}
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
            <p className="text-secondary mb-0">
              © {new Date().getFullYear()} AI Interview Platform. All rights reserved.
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <div className="d-flex justify-content-center justify-content-md-end gap-4">
              <Link to="/privacy" className="text-secondary text-decoration-none">Privacy</Link>
              <Link to="/terms" className="text-secondary text-decoration-none">Terms</Link>
              <Link to="/cookies" className="text-secondary text-decoration-none">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}