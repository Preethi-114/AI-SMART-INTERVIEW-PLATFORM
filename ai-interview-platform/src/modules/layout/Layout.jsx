// src/layout/Layout.jsx
import Header from "./Header";
import Footer from "./Footer";
import "../../styles/main.css";

// Add these profile-specific styles to your main.css or inline
const profileStyles = `
.profile-wrapper {
  padding: 30px 20px;
  min-height: calc(100vh - 80px);
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.profile-container {
  max-width: 1000px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.profile-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.profile-header h3 {
  color: #333;
  margin-bottom: 10px;
}

.completion-badge {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
}

.profile-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: box-shadow 0.3s;
  margin-bottom: 24px;
}

.profile-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.card-header {
  background: #f8f9fa;
  padding: 16px 24px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h5 {
  margin: 0;
  color: #333;
  font-weight: 600;
}

.card-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.3s;
}

.form-control:focus {
  border-color: #4a6cf7;
  box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.1);
  outline: none;
}

.is-invalid {
  border-color: #dc3545 !important;
}

.invalid-feedback {
  display: block;
  color: #dc3545;
  font-size: 14px;
  margin-top: 4px;
}

/* Skills Styles */
.add-skill-section {
  background: #f8f9ff;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.skills-display {
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #eee;
}

.skill-category h6 {
  color: #495057;
  margin-bottom: 10px;
  font-weight: 600;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.skill-tag {
  background: #4a6cf7;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Photo Upload Styles */
.photo-upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.photo-preview {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  border: 3px solid #e0e0e0;
}

.profile-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  color: #6c757d;
}

/* Resume Upload Styles */
.resume-upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.resume-preview {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  width: 100%;
}

.resume-icon {
  font-size: 48px;
  color: #dc3545;
}

.resume-placeholder {
  padding: 40px;
  text-align: center;
  color: #6c757d;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  width: 100%;
}

/* Submit Button */
.submit-section {
  text-align: center;
  padding: 30px 0;
}

.btn-primary {
  background: linear-gradient(135deg, #4a6cf7 0%, #3a56d4 100%);
  color: white;
  border: none;
  padding: 12px 40px;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(74, 108, 247, 0.3);
}

.btn-primary:disabled {
  background: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Badge Styles */
.badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 500;
  font-size: 14px;
}

.badge-primary {
  background: #007bff;
  color: white;
}

.badge-success {
  background: #28a745;
  color: white;
}

.badge-info {
  background: #17a2b8;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
}

/* Alert Styles */
.alert {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid transparent;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
  border-color: #c3e6cb;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
  border-color: #f5c6cb;
}
`;

export default function Layout({ children }) {
  // Add profile styles to the page
  const addProfileStyles = () => {
    const styleElement = document.createElement('style');
    styleElement.textContent = profileStyles;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  };

  // You can call addProfileStyles in useEffect if needed
  // useEffect(() => {
  //   const cleanup = addProfileStyles();
  //   return cleanup;
  // }, []);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1">
        {children}
      </main>
      {/* <Footer /> */}
      <style jsx="true">{profileStyles}</style>
    </div>
  );
}