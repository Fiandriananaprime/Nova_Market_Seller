import { Navigate, Outlet, useLocation } from "react-router"

 const ProtectedRoute = () => {
  const location = useLocation()
  const accessToken = localStorage.getItem("accessToken")

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

export default ProtectedRoute