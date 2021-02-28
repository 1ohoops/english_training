import { useRef, useState } from 'react';
import { message, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import './App.css';
import { LoRoF, get_v } from './axios/axios'
import {
  withRouter,
} from "react-router-dom";
import { connect } from "react-redux";
import all_actions from "./storage/create_action";

function L(props){
  return (
    <div className='form_card'>
      <div>
        账号: <input type='text' className='Login_input' onChange={ (e)=>props.v_c(e,0) }></input>
      </div>
      <div>
        密码: <input type='text' className='Login_input' onChange={ (e)=>props.v_c(e,1) }></input>
      </div>
      <div className='type_change'>
        <span onClick={ ()=>props.t_c('忘记') }>忘记密码</span>
        <span onClick={ ()=>props.t_c('注册') }>注册账号</span>
      </div>
    </div>
  )
}

function R(props){
  return (
    <div className='form_card'>
      <div>
        账号: <input type='text' className='Login_input' onChange={ (e)=>props.v_c(e,0) }></input>
      </div> 
      <div>
        密码: <input type='text' className='Login_input' onChange={ (e)=>props.v_c(e,1) }></input>
      </div>
      <div>
        邮箱: <input type='text' className='Login_input' onChange={ (e)=>props.v_c(e,2) }></input>
      </div>
      <div>
        验证码: <input type='text' className='Login_input_other' onChange={ (e)=>props.v_c(e,3) }></input>
        <span className='input_test' onClick={ props.get_verification }>获取验证码</span>
      </div>
      <div className='type_change'>
        <span onClick={ ()=>props.t_c('登录')  }>返回登陆</span>
      </div>
    </div>
  )
}

function F(props){
  return (
    <div className='form_card'>
      <div>
        账号: <input type='text' className='Login_input' onChange={ (e)=>props.v_c(e,0) }></input>
      </div>
      <div>
        新密码: <input type='text' className='Login_input' onChange={ (e)=>props.v_c(e,1) }></input>
      </div>
      <div>
        验证码: <input type='text' className='Login_input_other' onChange={ (e)=>props.v_c(e,2) }></input>
        <span className='input_test' onClick={ props.get_verification }>获取验证码</span>
      </div>
      <div className='type_change'>
        <span onClick={ ()=>props.t_c('注册') }>注册账号</span>
        <span onClick={ ()=>props.t_c('登录') }>返回登陆</span>
      </div>
    </div>
  )
}

function App(props) {
  let [type,type_change]=useState('登录');
  let card=useRef(null);
  let btn=useRef(null);
  let [value,value_change]=useState([]);
  let [err,err_change]=useState(false);
  let [L_suc,L_suc_change]=useState(false);
  let type_form={
    '登录':L,
    '注册':R,
    '忘记':F,
  };

  let T=type_form[type];

  function t_c(kind){
    card.current.className+=' type_trun';
    value_change([]);
    err_change(false);
    setTimeout(()=>{
      type_change(kind);
      card.current.className='Login_card'
    },300);
  }

  function get_verification(){
    let account, mail, information;
    if(type==='注册'){
      [ account, , mail] = value;
      let reg = /^[a-zA-Z0-9_-]+@([a-zA-Z0-9]+\.)+(com|cn|net|org)$/;
      let isok= reg.test(mail);
      if(!isok) {
        message.error("邮箱格式不正确，请重新输入！");
        return ;
      }
      information = { account, mail, type }
    }
    else if(type==='忘记'){
      [ account ] = value;
      information = { account, type }
    }
    get_v( type, information)
    .then((response)=>{
      if( response.data ){
        message.success('验证码发送至邮箱')
      }
      else{
        message.error('操作失败，请重试')
      }
    })
    .catch(()=>{
      message.error('操作失败，请稍后重试')
    })
  }

  function confirm(){
    if(L_suc)return;
    if(err){
      message.error('输入错误'); 
      return ;
    }
    else{
      if( value.length===0 ){
        message.error('输入无效');
        return ;
      }
      for( let i of value ){
        if( i === '' ){
          message.error('输入无效');
          return ;
        }
      }
      let information;
      if(type==='注册'){
        let [account, password, mail, verification] = value;
        information = { account, password, mail, verification }
      }
      else if(type==='登录'){
        let [account, password] = value;
        information = { account, password }
        L_suc_change(true);
        btn.current.className+=' btn_change';
      }
      else if(type==='忘记'){
        let [account, password, verification] = value;
        information = { account, password, verification }
      }
      LoRoF( type, information)
      .then((response)=>{
        if( response.data.success ){
          if(type === '注册'){
            message.success('注册成功');
            t_c('登录');
            return;
          }
          else if(type === '登录'){
            message.success('正在登录');
            props.login(information.account)
            window.sessionStorage.setItem('account', information.account);
            card.current.className+=' Login_card_leave';
            setTimeout(()=>{
              props.history.replace('/user_page')
            },500);
            return;
          }
          else{
            message.success('修改成功');
            t_c('登录');
            return;
          }
        }
        else{
          message.error( response.data.info )
        }
      })
      .catch((err)=>{ console.log(err)
        message.error( '操作失败，请稍后重试' );
      })
    }
  }

  function v_c(e,num){
    if(num===0){
      if(/[^\d]/.test(e.target.value)||e.target.value===''||e.target.value.length>12||e.target.value.length<8){
        e.target.parentNode.className='value_error';
        err_change(true);
      }
      else{
        e.target.parentNode.className='';
        err_change(false);
      }
    }
    else if(num===1){
      if(/[^\d\.。@_A-z]|\^/.test(e.target.value)||e.target.value===''||e.target.value.length>12||e.target.value.length<8){
        e.target.parentNode.className='value_error';
        err_change(true);
      }
      else{
        e.target.parentNode.className='';
        err_change(false);
      }
    }
    let [...old]=value;
    old[num]=e.target.value;
    value_change(old);
  }

  let LRF=(
    <div className='Login_card' ref={ card }>
      <div className='Login_type'>
        { type==='忘记'?type+'密码':type }
      </div>
      {
        <T t_c={ t_c } get_verification={ get_verification } v_c={ v_c }/>
      }
      <div className='Login_btn' onClick={ confirm } >
          <div ref={ btn }>
            {
              !L_suc?'确定':<Spin indicator={<LoadingOutlined className='spin' spin />} />
            }
          </div>
      </div>
    </div>
  );

  return (
    <>
      <div className='Login_background'>
        { LRF }
      </div>
    </>
  )
}

export default connect((state)=>({
  account : state.account
}),
{
  login : all_actions.login
})(withRouter(App));
