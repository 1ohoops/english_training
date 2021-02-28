import './my.css'
import { Button, message } from 'antd';
import { SoundFilled } from '@ant-design/icons';
import { useRef, useState, useEffect } from 'react';
import {
  withRouter
} from "react-router-dom";
import { connect } from "react-redux";
import all_actions from "../storage/create_action";
import axios from "axios";
import u from '../url'

function My(props){  
  let board=useRef(null);
  let [words,words_change]=useState([]);
  let [book_words,book_words_change]=useState({ learned : [] , no : [] });
  let [type,type_change]=useState('');
  let [book_choose,book_choose_change]=useState({ node:'', name:'' });
  let [words_part_type,words_part_type_change]=useState('learned')
  let [word_message,word_message_change]=useState({})
  let books=['cet-4','cet-6','tem-4','tem-8'];

  function my_items_clickout(){
    if(board.current.lastChild.lastChild.className == 'word_message_board word_message_board_show'){
      board.current.lastChild.lastChild.className='word_message_board'
    }
    else if(book_choose.name===''){
      board.current.className='my_item_board';
    }
    else{
      books_choose_out();
    }
  }

  function get_collect_words(start, num) {
    axios.get(`${ u }/user_page/my/words_collect?account=${ props.account }&start=${ start }&num=${ num }`)
    .then((result)=>{
      if(result.data.length){
        words_change([...words,...result.data])
      }
      else{
        message.success('没有更多单词了哦!')
      }
    })
    .catch(()=>{
      message.error('暂时无法获取单词')
    })
  }

  function my_items_click(t){
    if(t==='books'){
      type_change('books');
    }
    else{
      type_change('collect');
      if(words.length === 0){
        get_collect_words(0,50)
      }
    }
    board.current.className='my_item_board my_item_board_show';
  }

  function books_choose_out(){
    board.current.className='my_item_board my_item_board_show';
    book_choose.node.parentNode.className='my_item_board_container'
    book_choose.node.className='books_item';
    book_choose.node.style='';
    book_choose_change({ node:'', name:'' });
    words_part_type_change('learned')
  }

  function books_choose(e, value){
    if(!book_choose.name){
      let target=e.target;
      let font_size = document.documentElement.style.fontSize.slice(0,-2);
      let offsetLeft, offsetTop;
      target.parentNode.className+=' my_item_board_container_chosed';
      target.className='books_item books_item_choose';
      board.current.className='my_item_board my_item_board_show books_item_choose_show';
      if(target.offsetTop - font_size*0.02 <= 1)offsetTop = 0
      else offsetTop = 0.02 - target.offsetTop / font_size;
      if(target.offsetLeft - font_size*0.02 <= 1 )offsetLeft = 0
      else offsetLeft = 0.02 - target.offsetLeft / font_size;
      if(offsetLeft && offsetTop){
        target.style=`transform: translate(${ offsetLeft }rem ,${ offsetTop }rem );`;
      }
      else if(offsetTop){
        target.style=`transform: translateY( ${ offsetTop }rem );`;
      }
      else if(offsetLeft){
        target.style=`transform: translateX( ${ offsetLeft }rem );`;
      }
      book_choose_change({ node: target, name : value.replace('-','_') });
      get_book_words('learned', value.replace('-','_'), 0, 50)
      get_book_words('no', value.replace('-','_'), 0, 50)
    }
  }

  function get_book_words(type, name, start, num, add = false){
    axios.get(`${ u }/user_page/my/book_words?account=${ props.account }&type=${ type }&name=${ name }&start=${ start }&num=${ num }`)
    .then((result)=>{
      let data = result.data
      if(data.length){
        book_words = {...book_words}
        if(!add)book_words[type] = [...data]
        else book_words[type] = [...book_words[type],...data]
        book_words_change(book_words)
      }
      else{
        message.success('没有更多单词了哦!')
      }
    })
    .catch((err)=>{
      name = name.replace('_','_')
      type = type === 'learned'?'已学':'未学'
      message.error(`获取${ name }${ type }部分单词失败`)
    })
  }

  function books_item_main_title(e,side) {
    if(side==='left'&&words_part_type=='no'){
      e.target.parentNode.className='books_item_main_title'
      words_part_type_change('learned')
    }
    else if(side==='right'&&words_part_type=='learned'){
      e.target.parentNode.className='books_item_main_title right'
      words_part_type_change('no')
    }
  }

  function get_word_message(word) {
    let url = `${ u }/user_page/words/get_word_message?account=${ props.account }&type=${ type }&word=${ word }`
    if(type === 'books'){
      url += `&name=${ book_choose.name }&part=${ words_part_type }`
    }
    axios.get(url)
    .then((result)=>{
      console.log(result.data)
      word_message_change(result.data)
      board.current.lastChild.lastChild.className='word_message_board word_message_board_show'
    })
    .catch(()=>{
      message.error('暂时无法获取信息，稍后重试!')
    })
  }

  function break_out() {
    props.history.replace('/')
  }

  function get_word_mp3(type) {
    let audio = new Audio()
    audio.src = `${ u }/user_page/words/get_word_mp3?word=${ word_message.word }&path=${ word_message.path }&type=${ type }`
    audio.play();
  }

  let b=(
    <>
      {
        books.map((value)=>{
          return (
            <div className='books_item' onClick={ (e)=>books_choose(e, value) } key={ value }>
              { value }
            </div>
          )
        })
      }
      {
        book_choose.name===''?<></>:
        <div className='books_item_main'>
          <div className='books_item_main_title'>
            <div onClick={ (e)=>books_item_main_title(e,'left') }>已学</div>
            <div onClick={ (e)=>books_item_main_title(e,'right') }>未学</div>
          </div>
          <div className='books_item_main_words'>
            {
              book_words[words_part_type].length > 0?
              <>
              {
                book_words[words_part_type].map((value, index)=>{
                  return (
                    <div className='books_item_main_word' key={ value.word } onClick={ ()=>get_word_message(value.word) }>
                      { index + 1 + '. 单词: ' + value.word + ', 音标: ' + value.accent + ', 翻译: ' + value.mean_cn }
                    </div>
                  )
                })
              }
              <div className='books_item_main_word' key='~' onClick={ ()=>get_book_words(words_part_type,book_choose.name,book_words[words_part_type].length,50,true) }>点击加载更多...</div>
              </>:
              <div>
                暂时还没有发现单词哦!
              </div>
            }
          </div>
        </div>
      }
    </>
  )

  let collect=(
    <>
      {
        words.length > 0 ?
        <>
        {
          words.map((value, index)=>{
            return (
              <div className='words_item' key={ value.word } onClick={ ()=>get_word_message(value.word) }>
                { index + 1 + '. 单词: ' + value.word + ', 音标: ' + value.accent + ', 翻译: ' + value.mean_cn }
              </div>
            )
          })
        }
        <div className='words_item' key='~' onClick={ ()=>get_collect_words(words.length,50) }>点击加载更多...</div>
        </>:
        <div>
          还没有收藏的单词哦!
        </div>
      }
    </>
  );

  useEffect(()=>{
    // console.log(book_choose)
  })

  return (
    <div className='my'>
      <div className='my_title'>
        <span>PERSON</span>
        <span>CENTER</span>
      </div>
      <div className='my_main'>
        <div className='my_items'>
          <div onClick={ ()=>my_items_click('books') }>专业单词书籍</div>
          <div onClick={ ()=>my_items_click('collect') }>收藏的单词</div>
          <Button type="primary" danger className='break_out_btn' onClick={ break_out }>退出登录</Button>
          <div className='my_item_board' ref={ board }>
            <div onClick={ my_items_clickout }>&lt;</div>
            <div className='my_item_board_container'>
              {
                type==='books'?b:collect
              }
              <div className='word_message_board'>
                <div className='word'>
                  {
                    word_message.word?
                    <>
                      <div>
                        <div>{ word_message.word }</div>
                        <div>{ word_message.accent }</div>
                        <div>{ word_message.mean_cn }</div>
                        <div><SoundFilled onClick={ ()=>get_word_mp3('word') }/></div>
                      </div>
                      {
                        word_message.sentence_img!='undefined'&&word_message.sentence_img?
                        <div className='word_img'>
                          <img src={`${ u }/user_page/words/get_word_img?word=${ word_message.word }&path=${ word_message.path }&name=${ word_message.sentence_img }`}></img>
                        </div>:
                        <></>
                      }
                    </>:
                    <></>
                  }
                </div>
                <div className='word_sentence'>
                  {
                    word_message.word?
                    <>
                      <div>
                        <div>例句 : { word_message.sentence }</div>
                        <div>翻译 : { word_message.sentence_trans }</div>
                        <div><SoundFilled onClick={ ()=>get_word_mp3('sentence') }/></div>
                      </div>
                      <div className='sentence_img'>
                        <img src={`${ u }/user_page/words/get_word_img?word=${ word_message.word }&path=${ word_message.path }&name=${ word_message.word_img }`}></img>
                      </div>
                    </>:
                    <></>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default connect((state)=>({
  account : state.account
}),
{
  login : all_actions.login
})(withRouter(My))