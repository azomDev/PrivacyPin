import { render } from "solid-js/web";
import { Router, Route } from "@solidjs/router";
import AccountCreation from "./AccountCreation";
import AccountCreated from "./AccountCreated";
import { Component } from "solid-js";

const App = (props) => (
	<>
		<h1>Welcome to PrivacyPin</h1>
		{props.children}
	</>
);

export default App;
