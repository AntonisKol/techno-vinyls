import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux";
import { store } from "./store/store";

// On adnsaudio.com the app renders inside the Techno Vinyls page
// (#techno-vinyls); on its own it renders in #root with the site navigation.
const embedded = document.getElementById("techno-vinyls");
const root = ReactDOM.createRoot(embedded ?? document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App embedded={embedded !== null} />
    </Provider>
  </React.StrictMode>
);
