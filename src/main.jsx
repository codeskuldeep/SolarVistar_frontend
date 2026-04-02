import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './context/store';
import './index.css';
import App from './App';
import ToastContainer from './components/ToastContainer';


ReactDOM.createRoot(document.getElementById('root')).render(
    <Provider store={store}>
      <App />
      <ToastContainer />
    </Provider>
);




//Pagination

//Leads Debouncing 

//Quotations Send to whatsapp!

//Remote set 