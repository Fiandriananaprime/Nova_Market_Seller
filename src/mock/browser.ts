import { setupWorker } from "msw/browser";
import {
	authHandlers,
	deliveryHandlers,
	customerHandlers,
	handlers,
	orderHandlers,
	productHandlers,
	reviewHandlers,
	storeHandlers,
} from "./handler";
import { accountHandlers } from "./accountHandlers";
import { realtimeHandlers } from "./realtimeHandlers";

export const worker = setupWorker(
	...accountHandlers,
	...handlers,
	...authHandlers,
	...deliveryHandlers,
	...customerHandlers,
	...orderHandlers,
	...productHandlers,
	...reviewHandlers,
	...storeHandlers,
	...realtimeHandlers,
);