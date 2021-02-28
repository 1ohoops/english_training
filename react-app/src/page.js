import './page.css'
import { Tooltip, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import {
  Switch,
  Route,
  Redirect,
  NavLink,
} from "react-router-dom";
import { useRef, useEffect, useState } from 'react';
import Words from './body/words'
import Train from './body/train'
import My from './body/my'
import axios from "axios";
import { connect } from "react-redux";
import url from './url';

function Page(props){
  let select_title=useRef(null);
  let [page_img,have_page_img] = useState(true);

  function page_img_err(){
    have_page_img(false);
  }

  function title_change(num) {
    if(num===2){
      select_title.current.className='select_items middle';
    }
    else if(num===3){
      select_title.current.className='select_items bottom';
    }
    else{
      select_title.current.className='select_items';
    }
  }

  function page_img_change(e) {
    if(!/^image\//.test(e.target.files[0].type)){
      message.error('请选择图片文件');
    }
    else if(e.target.files[0].size > 1024 * 1024){
      message.error('图片不大于1m');
    }
    else if(e.target.files[0].size === 0){
      message.error('图片出错');
    }
    else{
      message.success('图片选择成功');
      let formdata = new FormData();
      formdata.append('img', e.target.files[0], e.target.files[0].name)
      formdata.append('account', props.account)
      axios.post(`${ url }/user_page/img_update`, formdata, {
        header : {
          'Content-Type' : 'multipart/form-data'
        }
      })
      .then((response)=>{
        message.success('上传成功');
        have_page_img(true)
      })
      .catch(()=>{
        message.error('上传出错');
      })
    }
    e.target.value = null
  }

  return (
    <div className='page_whole'>
      <div className='page_aside'>
        <Tooltip title="点击上传头像">
          <div className='page_img'>
            { !page_img?
              <UserOutlined className='page_img_item'/>:
              <img src={`${ url }/user_page/img_get?account=${ props.account }`} onError={ page_img_err }/> }
            <input type='file' className='page_img_update' onChange={ page_img_change }></input>
          </div>
        </Tooltip>
        <div className='id_message'>
          <div>ID: { props.account }</div>
          <div>昵称: { 'User 👻' }</div>
        </div>
        <div className='select_items' ref={ select_title }>
          <div>
            <div className='select_title'>
              <NavLink replace to='/user_page/words' onClick={ (e)=>title_change(1) } 
              activeClassName="select_title_item_selected" className='select_title_item'>单词</NavLink>
            </div>
          </div>
          <div>
            <div className='select_title'>
              <NavLink replace to='/user_page/train' onClick={ (e)=>title_change(2) } 
              activeClassName="select_title_item_selected" className='select_title_item'>训练</NavLink>
            </div>
          </div>
          <div>
            <div className='select_title'>
              <NavLink replace to='/user_page/My' onClick={ (e)=>title_change(3) } 
              activeClassName="select_title_item_selected" className='select_title_item'>我</NavLink>
            </div>
          </div>
        </div>
      </div>
      <div className='page_body'>
        <Switch>
          <Route path="/user_page/words">
            <Words />
          </Route>
          <Route path="/user_page/train">
            <Train />
          </Route>
          <Route path="/user_page/My">
            <My />
          </Route>
          <Redirect to="/user_page/words" />
        </Switch>
      </div>
    </div>
  )
}

export default connect((state)=>({
  account : state.account
}),
{

})(Page)