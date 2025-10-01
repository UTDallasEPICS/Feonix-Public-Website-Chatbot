import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import reactToWebComponent from "react-to-webcomponent";

const ChatBotWebComponent = reactToWebComponent(App, React, ReactDOM, {
  shadow: "open",
});

customElements.define("chat-bot-component", ChatBotWebComponent);
