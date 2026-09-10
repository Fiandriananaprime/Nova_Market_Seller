import { BrowserRouter } from "react-router"
import AppRoutes from "./Route"

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}