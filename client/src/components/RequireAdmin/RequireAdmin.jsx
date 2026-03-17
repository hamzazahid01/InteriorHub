import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAuthed } from "../../utils/auth";

export default function RequireAdmin() {
  const location = useLocation();
  if (!isAuthed()) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

