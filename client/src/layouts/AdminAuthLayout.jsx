import { Outlet } from "react-router-dom";

export default function AdminAuthLayout() {
  return (
    <div className="app">
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}

