import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'antd/dist/antd.css';
import { BrowserRouter } from 'react-router-dom';
import Page from './page';
import {
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import { Provider } from "react-redux";
import store from './storage/store';

let screen=document.documentElement;
if(screen.clientWidth>850){
  document.documentElement.style.fontSize=screen.clientWidth+'px';
}
else{
  document.documentElement.style.fontSize='850px';
}

window.onresize=function(){
  let width=screen.clientWidth;
  if(width>=850){
    document.documentElement.style.fontSize=width+'px';
  }
  else{
    document.documentElement.style.fontSize='850px';
  }
}

ReactDOM.render(
  <React.StrictMode>
    <Provider store = { store }>
      <BrowserRouter>
        <Switch>
          <Route path="/main">
            <App />
          </Route>
          <Route path="/user_page">
            <Page />
          </Route>
          <Redirect to="/main" />
        </Switch>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
