import './words.css'
import { useRef, useState, useEffect } from 'react';
import { connect } from "react-redux";
import all_actions from "../storage/create_action";
import axios from 'axios'
import { message, Progress } from 'antd';
import { SoundFilled } from '@ant-design/icons';
import url from '../url'

function Words(props){
  let card_one=useRef(null);
  let card_two=useRef(null);
  let card_three=useRef(null);
  let start_area=useRef(null);
  let [s,s_c]=useState(false);
  let words=useRef(null);
  let slider=useRef(null);
  let other_books_card=useRef(null);
  let [word_card,word_card_change]=useState({ words:[], index:0, finish:false, view:[], type:'learn' })
  let [all_books, all_books_change]=useState({
    select:{
      get : false,
      name : 'cet_4',
      target : 20,
      review : 0
    },
    cet_4:{
      words : 0,
      all_words : 0,
    },
    cet_6:{
      words : 0,
      all_words : 0,
    },
    tem_4:{
      words : 0,
      all_words : 0,
    },
    tem_8:{
      words : 0,
      all_words : 0,
    }
  });
  let books=['cet_4','cet_6','tem_4','tem_8'];

  function start(type){
    words.current.className='words leave'
    if(s){
      setTimeout(()=>{
        s_c(!s);
        if(word_card.finish){
          all_books = {...all_books}
          if(word_card.type==='learn'){
            all_books.select.target -= 1
            all_books[all_books.select.name].words += 1
          }
          else{
            all_books.select.review -= 1
          }
          all_books_change(all_books)
          word_card = {...word_card}
          word_card.finish = false
          word_card.type==='learn'?word_card.words.splice(word_card.index,1):word_card.review.splice(word_card.index,1)
          word_card.index = 0
          word_card_change(word_card)
        }
        words.current.className='words'
        card_two.current.className='other_books';
        card_three.current.className='today_target';
      },500)
    }
    else{
      if(all_books.select.target > 0 && all_books.select.target > word_card.words.length){
        axios.get(`${ url }/user_page/words/get_start?account=${ props.account }&name=${ all_books.select.name }&target=${ all_books.select.target }`)
        .then((result)=>{
          word_card = {...word_card}
          word_card.words = result.data[0]
          word_card.review = result.data[1]
          word_card_change(word_card)
        })
        .catch(()=>{
          message.error('暂时无法获取资源!')
        })
      }
      word_card.type = type
      setTimeout(()=>{
        s_c(!s);
        words.current.className='words'
        card_two.current.className='card_two_small';
        card_three.current.className+=' card_three_small';
      },500);
    }
  }

function get_words() {
    axios.post(`${ url }/user_page/words/get_words`,{ account : props.account, books })
    .then((response)=>{
      let i
      let all_books_message = {...all_books}
      for(i = 0; i< response.data.length - 2 ; i++){
        all_books_message[ response.data[i][0].split('_').slice(0,2).join('_') ].all_words = response.data[i++][1]
        all_books_message[ response.data[i][0].split('_').slice(0,2).join('_') ].words = response.data[i][1]
        props[`${ response.data[i][0].split('_').slice(0,2).join('_') }_update`]({all : response.data[i-1][1], learned : response.data[i][1]})
      }
      all_books_message.select.target = response.data[i++][1]
      all_books_message.select.review = response.data[i][1]
      all_books_message.select.get = true
      all_books_change(all_books_message)
    })
    .catch((err)=>{
      console.log(err)
    })
  }

  function books_change(value){
    if(value !== all_books.select.name ){
      all_books = { ...all_books }
      all_books.select.name = value
      all_books_change( all_books )
    }
  }

  function target_change(type, value) {
    function try_again(type, value) {
      all_books = { ...all_books }
      all_books.select.target = value
      axios(`${ url }/user_page/words/change_target?account=${ props.account }&value=${ value }`)
      .then(()=>{
        all_books_change(all_books)
      })
      .catch(()=>{
        target_change(type, value)
      })
    }

    if(!s){
      if(type === 'choose'){
        if( all_books.select.target == value ) return;
        try_again(type, value)
      }
      slider.current.className = slider.current.className === 'slider_select'?'slider_select slider_move':'slider_select'
      setTimeout(()=>{
        slider.current.firstChild.style=''
      },500)
    }
  }

  useEffect(() => {
    if(!all_books.select.get){
      get_words();
    }
  });

  function w() {
    let style = 0;
    return (e)=>{
      let distance;
      let target = slider.current.firstChild;
      let font_size = document.documentElement.style.fontSize.slice(0,-2);
      let offsetTop = -target.offsetTop / font_size;

      if (e.nativeEvent.deltaY <= 0) {
        if(style < offsetTop ){
          distance = (offsetTop - style) > 0.05 ? 0.05 : offsetTop - style
          style = distance + style
          target.style=`transform: translateY(${ style }rem)`
        }
        else if(style > offsetTop){
          distance = style - offsetTop
          style -= distance
          target.style=`transform: translateY(${ style }rem)`
        }
      } 
      else
      {
        let parent_size = (slider.current.clientHeight / font_size) / 2
        let target_size = (target.scrollHeight / font_size) / 2
        let l = target_size - parent_size
        if( style + l > 0 ){
          distance = (style + l) > 0.05 ? 0.05 : style + l
          style -= distance
          target.style=`transform: translateY(${ style }rem)`
        }
        else if(style + l < 0){
          distance = l + style
          style -= distance
          target.style=`transform: translateY(${ style }rem)`
        }
      }
    }
  }

  function show_answer() {
    if(start_area.current.firstChild.className=='test_area test_area_show'){
      start_area.current.firstChild.className='test_area'
      start_area.current.lastChild.className='answer_area'
    }
    else{
      start_area.current.firstChild.className='test_area test_area_show'
      start_area.current.lastChild.className='answer_area answer_area_show'
    }
  }

  function get_word_mp3(type) { 
    let audio = new Audio()
    let url
    if(word_card.type==='learn'){
      url = `${ url }/user_page/words/get_word_mp3?word=${ word_card.words[word_card.index].word }&path=${ word_card.words[word_card.index].path }&type=${ type }`
    }
    else{
      url = `${ url }/user_page/words/get_word_mp3?word=${ word_card.review[word_card.index].word }&path=${ word_card.review[word_card.index].path }&type=${ type }`
    }
    audio.src = url
    audio.play();
  }

  function word_collect() {
    let url
    if(word_card.type==='learn'){
      url = `${ url }/user_page/words/add_collect?account=${ props.account }&word=${ word_card.words[word_card.index].word }&path=${ word_card.words[word_card.index].path }`
    }
    else{
      url = `${ url }/user_page/words/add_collect?account=${ props.account }&word=${ word_card.review[word_card.index].word }&path=${ word_card.review[word_card.index].path }`
    }
    axios.get(url)
    .then(()=>{
      message.success('收藏成功!')
    })
    .catch(()=>{
      message.error('收藏出错,请重试!')
    })
  }

  function word_next() {  console.log('next1', word_card.finish)
    if(word_card.type === 'learn'){
      if( word_card.words.length === 1 ){
        if(word_card.finish){
          message.success('今日学习已完成!')
          start()
        }
        else{
          message.success('没有更多了!')
        }
      }
      else{
        let new_word_card = {...word_card}
        let i = new_word_card.index
        if(word_card.index === word_card.words.length - 1 ){
          new_word_card.index = 0
        }
        else{
          if(!word_card.finish) new_word_card.index += 1
        }
        if(word_card.finish){
          all_books = {...all_books}
          all_books.select.target -= 1
          all_books[all_books.select.name].words += 1
          all_books_change(all_books)
          new_word_card.words.splice(i, 1)
          new_word_card.finish = false
        }
        word_card_change(new_word_card)
      }
    }
    else{
      if( word_card.review.length === 1 ){
        if(word_card.finish){
          message.success('今日学习已完成!')
          start()
        }
        else{
          message.success('没有更多了!')
        }
      }
      else{
        let new_word_card = {...word_card}
        let i = new_word_card.index
        if(word_card.index === word_card.review.length - 1 ){
          new_word_card.index = 0
        }
        else{
          if(!word_card.finish) new_word_card.index += 1
        }
        if(word_card.finish){
          all_books = {...all_books}
          all_books.select.review -= 1
          all_books_change(all_books)
          new_word_card.review.splice(i, 1)
          new_word_card.finish = false
        }
        word_card_change(new_word_card)
      }
    }
    console.log('next2', word_card.finish)
  }

  function answer_judge(value) {  console.log('answer_judge', word_card.finish)
    if(word_card.type === 'learn'){
      if(value === word_card.words[word_card.index].mean_cn){
        message.success('选择正确😀')
        if(word_card.finish == false)word_learned(word_card.words[word_card.index].word, word_card.words[word_card.index].path)
        if(all_books.select.target > 0){
          // word_card = {...word_card}
          word_card.finish = true
          // word_card_change(word_card)
        }
      }
      else{
        message.error('选择错误🤢')
      }
    }
    else{
      if(value === word_card.review[word_card.index].mean_cn){
        console.log('11111111111',word_card.finish)
        message.success('选择正确😀')
        if(word_card.finish == false){
          console.log('222222',word_card.finish)
          word_review_finish(word_card.review[word_card.index].word)
        }
        word_card.finish = true
      }
      else{
        message.error('选择错误🤢')
      }
    }
  }

  function word_learned(word, path) {
    axios.get(`${ url }/user_page/words/word_learned?account=${ props.account }&word=${ word }&path=${ path }`)
    .then(()=>{

    })
    .catch(()=>{

    })
  }

  function word_review_finish(word){ console.log('word_review_finish', word)
    axios.get(`${ url }/user_page/words/word_review_finish?account=${ props.account }&word=${ word }`)
    .then((result)=>{
      
    })
    .catch((err)=>{
      console.log(err)
    })
  }

  return (
    <div className='words' ref={ words }>
      <div className='books_top'>
        <div className='book_name' ref={ card_one }>
          <div>❀{ all_books.select.name+'词汇' }</div>
          <div>
            <span className='day_target_left'>{ '每日目标 :' }</span>
            <span className='day_target_right'>
              <span className='day_target_righr_left'>{ all_books.select.target }词</span>
              <span className='day_target_righr_right' onClick={ target_change }>{ '修改' }</span>
            </span>
          </div>
          <div><Progress percent={ all_books[all_books.select.name].words*100 / all_books[all_books.select.name].all_words } showInfo={false} trailColor={ 'rgb(184, 184, 184)' }/></div>
          <div>
            <span>{ '已学单词' }</span>
            <span>{ all_books[all_books.select.name].words + ' / ' + all_books[all_books.select.name].all_words }</span>
          </div>
          <div className='slider_select' ref={ slider } onWheel={ w() }>
            <div>
            {
              (()=>{
                let i = 20;
                let back =[]
                for(i;i<=200;i+=20){
                  back.push(i)
                }
                return back
              })().map((value)=>{
                return(
                  <div key={ value } onClick={ ()=>target_change('choose', value) } className='slider_item'>
                    { value }
                  </div>
                )
              })
            }
            </div>
          </div>
        </div>
        <div className='other_books' ref={ card_two }>
          <div className='other_books_card' ref={ other_books_card }>
            {
              books.map((value)=>{
                return (
                  <div key = { value } className='books_select_card' onClick={ ()=>books_change(value) }>
                    <div>{ value }</div>
                    <div className='books_select_learned'>
                      <div>已学单词:</div>
                      <div>{ all_books[value].words + '/' + all_books[value].all_words }</div>
                    </div>
                    <div className={ value === all_books.select.name?'books_select_change':'' } onClick={ ()=>books_change(value) }>
                      { value === all_books.select.name?'当前学习':'切换计划' }
                    </div>
                  </div>
                )
              })
            }
          </div>
        </div>
        <div className='today_target' ref={ card_three }>
          <div className='today_target_title'>今日计划</div>
          <div className='today_target_words'>
            <div>
              <div>需新学</div>
              <div>{ all_books.select.target }<span>词</span></div>
            </div>
            <div>
              <div>需复习</div>
              <div>{ all_books.select.review }<span>词</span></div>
            </div>
          </div>
          <div className='start_btn_container'>
            <div className='start_btn' onClick={ ()=>start('learn') }>{ !s?'开始练习':'退出练习' }</div>
            { !s?<div className='start_btn' onClick={ ()=>start('review') }>{ '开始复习' }</div>:<></> }
          </div>
        </div>
      </div>
      {
        !s||word_card.words.length==0?<></>:
        <div className='start_area' ref={ start_area }>
          <div className='test_area'>
            <div className='test_word'>{ word_card.type==='learn'?word_card.words[word_card.index].word:word_card.review[word_card.index].word }</div>
            <div className='test_select_btn'>
              {
                word_card.type === 'learn'?
                [0,1,2,3].sort(()=>{
                  return Math.random() > 0.5 ? -1 : 1
                }).map((value)=>{
                  if(word_card.index + value > word_card.words.length - 1){
                    if( value - 1 <  word_card.index ) return word_card.words[value - 1]
                  }
                  else{
                    return word_card.words[value + word_card.index ]
                  }
                }).filter((value)=>{
                  if(value) return value
                })
                .map((value, index)=>{
                  return (
                    <div onClick={ ()=>answer_judge(value.mean_cn) } key={ index }>
                      { value.mean_cn }
                    </div>
                  )
                }):
                [0,1,2,3].sort(()=>{
                  return Math.random() > 0.5 ? -1 : 1
                }).map((value)=>{
                  if(word_card.index + value > word_card.review.length - 1){
                    if( value - 1 <  word_card.index ) return word_card.review[value - 1]
                  }
                  else{
                    return word_card.review[value + word_card.index ]
                  }
                }).filter((value)=>{
                  if(value) return value
                })
                .map((value, index)=>{
                  return (
                    <div onClick={ ()=>answer_judge(value.mean_cn) } key={ index }>
                      { value.mean_cn }
                    </div>
                  )
                })
              }
            </div>
            <div className='test_help'>
              <div onClick={ word_collect }>收藏</div>
              <div onClick={ show_answer }>求助</div>
              <div onClick={ word_next }>next</div>
            </div>
          </div>
          <div className='answer_area'>
            <div>{ word_card.type==='learn'?word_card.words[word_card.index].word:word_card.review[word_card.index].word } <SoundFilled onClick={ ()=>get_word_mp3('word') }/></div>
            <div>{ word_card.type==='learn'?word_card.words[word_card.index].accent:word_card.review[word_card.index].accent }</div>
            <div>{ word_card.type==='learn'?word_card.words[word_card.index].mean_cn:word_card.review[word_card.index].mean_cn }</div>
            {
              word_card.type==='learn'?
              (
                word_card.words[word_card.index].sentence_img!='undefined'&&word_card.words[word_card.index].sentence_img?
                <div>
                  <img src={`${ url }/user_page/words/get_word_img?word=${ word_card.words[word_card.index].word }&path=${ word_card.words[word_card.index].path }&name=${ word_card.words[word_card.index].sentence_img }`}></img>
                </div>:
                <></>
              ):
              (
                word_card.review[word_card.index].sentence_img!='undefined'&&word_card.review[word_card.index].sentence_img?
                <div>
                  <img src={`${ url }/user_page/words/get_word_img?word=${ word_card.review[word_card.index].word }&path=${ word_card.review[word_card.index].path }&name=${ word_card.review[word_card.index].sentence_img }`}></img>
                </div>:
                <></>
              )
            }
            <div>例句 : { word_card.type==='learn'?word_card.words[word_card.index].sentence:word_card.review[word_card.index].sentence } <SoundFilled onClick={ ()=>get_word_mp3('sentence') }/></div>
            <div>中文 : { word_card.type==='learn'?word_card.words[word_card.index].sentence_trans:word_card.review[word_card.index].sentence_trans }</div>
            <div>
              <img src={`${ url }/user_page/words/get_word_img?word=${ word_card.type==='learn'?word_card.words[word_card.index].word:word_card.review[word_card.index].word }&path=${ word_card.type==='learn'?word_card.words[word_card.index].path:word_card.review[word_card.index].path }&name=${ word_card.type==='learn'?word_card.words[word_card.index].word_img:word_card.review[word_card.index].word_img }`}></img>
            </div>
          </div>
        </div>
      }
    </div>
  )
}

export default connect((state)=>({
  account : state.account
}),
{
  login : all_actions.login,
  cet_4_update : all_actions.cet_4_update,
  cet_6_update : all_actions.cet_6_update,
  tem_4_update : all_actions.tem_4_update,
  tem_8_update : all_actions.tem_8_update
})(Words);