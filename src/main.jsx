import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./context/store";
import "./index.css";
import App from "./App";
import ToastContainer from "./components/ToastContainer";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
    <ToastContainer />
  </Provider>,
);

//Quotations Send to whatsapp!

//existing customers, with statuses jin jin ka status converted ho wo, existing customers m show krenge !
//documents upload krne ka option dena h, there will be statuses also in there, 
//Document Collection (in progress/uploaded/verified/rejected)
//There should be an column for payment method Cash/Loan 
//Statuses for payment for cash
// 1. Customer installation 
// 2. Netmetering file verification (document)
// 3. Ready doc templates for sign
// 4. customer signed documents to be uploaded

//Statuses for payment for loan -later.