import { lazy, Suspense } from "react"
import { Navigate, Route, Routes } from "react-router"

import ProtectedRoute from "./components/ProtectedRoute"
import Shell from "./components/Shell"
import Login from "./pages/Login"

const Dashboard = lazy(() => import("./pages/Dashboard"))
const Orders = lazy(() => import("./pages/Orders"))
const Products = lazy(() => import("./pages/Products"))
const Inventory = lazy(() => import("./pages/Inventory"))
const Customers = lazy(() => import("./pages/Customers"))
const Reviews = lazy(() => import("./pages/Reviews"))
const Store = lazy(() => import("./pages/Store"))
const Analytics = lazy(() => import("./pages/Analytics"))
const Settings = lazy(() => import("./pages/Settings"))

function Loading() {
  return <div>Loading...</div>
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Shell />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/products" element={<Products />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/store" element={<Store />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Default */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}