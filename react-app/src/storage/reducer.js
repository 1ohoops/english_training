import {combineReducers} from 'redux'
 
function account(prestate, action) {
   if(window.location.pathname.split('/').slice(-1) != 'main') return window.sessionStorage.getItem('account')
   else if(prestate === undefined) return '';
   const {
      type,
      data
   } = action;
   if( type === 'login' ){
      return data;
   }
   else return prestate
}

function cet_4(prestate, action) {
   if(prestate === undefined) return {};
   const {
      type,
      data
   } = action;
   if( type == 'cet_4_update' ){
      return data;
   }
   else return prestate
}

function cet_6(prestate, action) {
   if(prestate === undefined) return {};
   const {
      type,
      data
   } = action;
   if( type == 'cet_6_update' ){
      return data;
   }
   else return prestate
}

function tem_4(prestate, action) {
   if(prestate === undefined) return {};
   const {
      type,
      data
   } = action;
   if( type == 'tem_4_update' ){
      return data;
   }
   else return prestate
}

function tem_8(prestate, action) {
   if(prestate === undefined) return {};
   const {
      type,
      data
   } = action;
   if( type == 'tem_8_update' ){
      return data;
   }
   else return prestate
}

 export default combineReducers({
   account,
   cet_4,
   cet_6,
   tem_4,
   tem_8
 })