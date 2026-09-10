import { setupWorker } from "msw/browser";
import {
	authHandlers,
	handlers,
	orderHandlers,
	productHandlers,
	reviewHandlers,
	storeHandlers,
} from "./handler";

export const worker = setupWorker(
	...handlers,
	...authHandlers,
	...orderHandlers,
	...productHandlers,
	...reviewHandlers,
	...storeHandlers,
);