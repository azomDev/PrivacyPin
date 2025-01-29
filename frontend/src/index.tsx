/* @refresh reload */
import "./index.css";
import { render } from "solid-js/web";

import App from "./App";
import AccountCreation from "./AccountCreation";
import AccountCreated from "./AccountCreated";
import { Route, Router } from "@solidjs/router";

render(
	() => (
		<Router root={App}>
			<Route path="/" component={AccountCreation} />
			<Route path="/account-created" component={AccountCreated} />
		</Router>
	),
	document.getElementById("root") as HTMLElement,
);
