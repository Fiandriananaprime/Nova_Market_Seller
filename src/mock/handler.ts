import { http, HttpResponse } from "msw";
import { sellerDashboard } from "./data/dashboard";

const API_URL = "http://localhost:4000/v2";

export const handlers = [
  http.get(`${API_URL}/seller/dashboard`, () => {
    return HttpResponse.json(sellerDashboard);
  }),
];