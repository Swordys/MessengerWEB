import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import registerServiceWorker from "./registerServiceWorker";

// CSS
import "./css/index.css";
// Components
import App from "./components/App";

// Redux
import store from "./store/Store";

ReactDOM.render(
  <Provider store={store()}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>,
  document.getElementById("root")
);
registerServiceWorker();

// {
//   "rules": {
//     ".read": "auth != null",
//     ".write":"auth != null"
//   }
// }
