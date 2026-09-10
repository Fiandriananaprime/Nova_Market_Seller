import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { I18nProvider } from "./context/LangContext"
import "./i18n"
import { StoreProvider } from './context/storeContext'
async function enableMocking() {
  if (import.meta.env.DEV) {
    const { worker } = await import("./mock/browser");

    await worker.start({
      onUnhandledRequest: "bypass",
    });
  }
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <StoreProvider>
        <I18nProvider>
          <App />
        </I18nProvider>
      </StoreProvider>
    </React.StrictMode>,
  );
});
