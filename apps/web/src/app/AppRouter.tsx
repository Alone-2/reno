import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuthSession } from "@/stores/auth-session";
import { AppShell } from "./AppShell";
import { CostPage, MaterialsPage, ProgressPage } from "./pages/domain-pages";
import { LoginPage } from "./pages/LoginPage";
import { OverviewRoute } from "./pages/OverviewRoute";
import { SpacesPage } from "./pages/SpacesPage";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = useAuthSession((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route index element={<OverviewRoute />} />
          <Route path="spaces" element={<SpacesPage />} />
          <Route path="materials" element={<MaterialsPage />} />
          <Route path="progress" element={<ProgressPage />} />
          <Route path="cost" element={<CostPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
