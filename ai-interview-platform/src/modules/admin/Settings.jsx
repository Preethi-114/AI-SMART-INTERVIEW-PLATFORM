// src/modules/admin/Settings.jsx
export default function Settings() {
  return (
    <div>
      <h3>Settings</h3>
      <form className="mt-3">
        <div className="mb-3">
          <label className="form-label">Site Name</label>
          <input type="text" className="form-control" defaultValue="Smart Interview Platform" />
        </div>
        <div className="mb-3">
          <label className="form-label">Admin Email</label>
          <input type="email" className="form-control" defaultValue="admin@example.com" />
        </div>
        <button type="submit" className="btn btn-primary">Save Changes</button>
      </form>
    </div>
  );
}
