import { useState } from "react";
import Shell, { type Page } from "./components/Shell";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
import Customers from "./pages/Customers";
import Reviews from "./pages/Reviews";
import Store from "./pages/Store";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");

  function renderPage() {
    switch (page) {
      case "dashboard": return <Dashboard onNavigate={setPage} />;
      case "orders":    return <Orders />;
      case "products":  return <Products />;
      case "inventory": return <Inventory />;
      case "customers": return <Customers />;
      case "reviews":   return <Reviews />;
      case "store":     return <Store />;
      case "analytics": return <Analytics />;
      case "settings":  return <Settings />;
      default: return null;
    }
  }

  return (
    <Shell page={page} onNavigate={setPage}>
      {renderPage()}
    </Shell>
  );
}
