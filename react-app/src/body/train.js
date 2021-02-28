import './train.css'
import { useRef, useState, useEffect } from 'react';
import { Tooltip } from 'antd';
import { SoundFilled } from '@ant-design/icons';
import { connect } from "react-redux";
import all_actions from "../storage/create_action";
import axios from 'axios';
import { message } from 'antd';
import url from '../url'

function Train(props){
  let main=useRef(null);
  let result=useRef(null);
  let [on_result,on_result_change]=useState(false);
  let [choose,choose_change]=useState(false);
  let items=['英文选义','中文选词','填空拼写','全拼默写'];
  let [kind,kind_change]=useState('');
  let [training_start,training_start_change] = useState({words:[],type:'',index:0, finish:false}) 
  let [input_word, input_word_change] = useState({answer:'',input:''})
  let [SW, SW_change] = useState({word:'',begin:'',end:'',width:''})

  function item_click(e,index,type){ 
    if(choose){
      main.current.className='train_main train_main_leave';
      setTimeout(()=>{
        choose_change(false);
        main.current.className='train_main train_main_show'
      },500)
    }
    else{
      let target=e.currentTarget;
      target.className+=' item_selected';
      main.current.className='train_main train_main_leave';
      switch (type){
        case '英文选义': training_start.type = 'EC' ;break;
        case '中文选词': training_start.type = 'CE' ;break;
        case '填空拼写': training_start.type = 'S' ;break;
        case '全拼默写': training_start.type = 'W' ;break;
      }
      training_get_words()
      setTimeout(()=>{
        target.className='train_item';
        choose_change(true);
        (index<=1?kind_change('choose'):index>2?kind_change('input_whole'):kind_change('input_some'));
        main.current.className='train_main train_main_show'
      },500)
    }
  }

  function training_get_words() {
    axios.post(`${ url }/user_page/train/get_words`,{ cet_4:props.cet_4,cet_6:props.cet_6,tem_4:props.tem_4,tem_8:props.tem_8 })
    .then((result)=>{
      training_start = {...training_start}
      training_start.words = result.data
      training_start_change(training_start)
    })
    .catch(()=>{
      message.error('出错了/(ㄒoㄒ)/~~')
    })
  }

  function get_result(){
    if(on_result){
      result.current.className='training_result';
      on_result_change(false);
    }
    else{
      result.current.className+=' result_show';
      on_result_change(true);
    }
  }

  function training_next() {
    if( training_start.words.length === 1 ){
      if(training_start.finish){
        message.success('训练完成!')
        item_click()
      }
      else{
        message.success('没有更多了!')
      }
    }
    else{
      let new_word_card = {...training_start}
      let i = new_word_card.index
      if(training_start.index === training_start.words.length - 1 ){
        new_word_card.index = 0
      }
      else{
        if(!training_start.finish) new_word_card.index += 1
      }
      if(training_start.finish){
        new_word_card.words.splice(i, 1)
        new_word_card.finish = false
      }
      training_start_change(new_word_card)
    }
    if(kind!='choose'){
      input_word={...input_word}
      input_word.input = ''
      input_word_change(input_word)
    }
  }

  useEffect(() => {
    // console.log(333)
  });

  function answer_judge(value) {
    if(kind=='choose'){
      let answer = training_start.type=='EC'?training_start.words[training_start.index].mean_cn:training_start.words[training_start.index].word
      if(value === answer){
        message.success('选择正确😀')
        training_start.finish = true
      }
      else{
        message.error('选择错误🤢')
      }
    }
    else{
      if(input_word.input === input_word.answer){
        message.success('正确😀')
        training_start.finish = true
      }
      else{
        message.error('错误🤢')
      }
    }
  }

  function word_get_mp3(type, part) {
    if(training_start.type == 'CE'&&!part){
      return;
    }
    else{
      let audio = new Audio()
      audio.src = `${ url }/user_page/train/get_word_mp3?word=${ training_start.words[training_start.index].word }&path=${ training_start.words[training_start.index].path }&type=${ type }`
      audio.play();
    }
  }

  // function training_input_word(e){
  //   input_word={...input_word}
  //   input_word.input = e.target.value
  //   // input_word_change(input_word)
  // }

  function training_input_confirm(e){
    // onChange={ training_input_word } value={input_word.input}
    input_word.input = e.target.value
    if(e.keyCode==13){
      answer_judge()
    }
  }

  function word_collect() {
    axios.get(`${ url }/user_page/words/add_collect?account=${ props.account }&word=${ training_start.words[training_start.index].word }&path=${ training_start.words[training_start.index].path }`)
    .then(()=>{
      message.success('收藏成功!')
    })
    .catch(()=>{
      message.error('收藏出错,请重试!')
    })
  }

  function EC(){
    return (
      <>
        <div className='training_words'>
          { training_start.words[training_start.index].word }
        </div>
        <div className='training_main_btn'>
          {
            [0,1,2,3].sort(()=>{
              return Math.random() > 0.5 ? -1 : 1
            }).map((value)=>{
              if(training_start.index + value > training_start.words.length - 1){
                if( value - 1 <  training_start.index ) return training_start.words[value]
              }
              else{
                return training_start.words[value + training_start.index ]
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
      </>
    )
  } 

  function CE(){
    return (
      <>
        <div className='training_words'>
          { training_start.words[training_start.index].mean_cn }
        </div>
        <div className='training_main_btn'>
          {
            [0,1,2,3].sort(()=>{
              return Math.random() > 0.5 ? -1 : 1
            }).map((value)=>{
              if(training_start.index + value > training_start.words.length - 1){
                if( value - 1 <  training_start.index ) return training_start.words[value - 1]
              }
              else{
                return training_start.words[value + training_start.index ]
              }
            }).filter((value)=>{
              if(value) return value
            })
            .map((value, index)=>{
              return (
                <div onClick={ ()=>answer_judge(value.word) } key={ index }>
                  { value.word }
                </div>
              )
            })
          }
        </div>
      </>
    )
  }

  function S(){
    if(SW.word != training_start.words[training_start.index].word){
      let word = training_start.words[training_start.index].word
      let start = Math.random()*word.length
      let length = word.length > 3? Math.floor(Math.random()*(word.length-2)) + 1 : 1
      let begin = word.slice(0,start)
      let end = word.slice((start+length))
      let width = String(0.025 + length * 0.007) + 'rem'
      SW.word=word
      SW.begin=begin
      SW.end=end
      SW.width=width
      input_word.answer=word.slice(start,(start+length))
    }
    return (
      <>
      { SW.begin }
      <Tooltip title="点击回车键确定">
          <input name='some' style={{width:SW.width}} autoFocus='autofocus' onKeyDown={training_input_confirm} type='text' autoComplete="off"></input>
      </Tooltip>
      { SW.end }
      </>
    )
  }

  function W(){
    input_word.answer=training_start.words[training_start.index].word
    return (
    <>
      <Tooltip title="点击回车键确定">
        <input className='training_input_whole' autoFocus='autofocus' onKeyDown={training_input_confirm} type='text' autoComplete="off"></input>
      </Tooltip>
    </>
    )
  }

  return (
    <div className='train'>
      <div className='train_title'>
        <span>TRAINING</span>
        <span>CENTER</span>
      </div>
      <div className='train_main' ref={ main }>
        {
          !choose?(
          items.map((value,index)=>{
              return (
                <div className='train_item' onClick={ (e)=>item_click(e,index,value) } key={ index }>
                  <div className='train_item_left'>{ value }</div>
                  <div className='train_item_right'>
                    <div className='train_item_right_item'>A</div>
                    <div className='train_item_right_item'>B</div>
                    <div className='train_item_right_item'>C</div>
                  </div>
                </div>
              )
          })
          ):(
            <div className='training_item'>
              <div className='training_btn' onClick={ item_click }><span>退出</span></div>
              <div className='training_main'>
                {
                  kind==='choose'?<>{
                    training_start.type == 'EC' ? <EC/> : <CE/>
                  }
                  </>
                  :(
                  <>
                    <div className='training_input'>
                      {
                        kind!=='input_whole'?<S/>:<W/>
                      }
                    </div>
                    <div className='training_input_word'>
                      { training_start.words[training_start.index].mean_cn }
                    </div>
                  </>)
                }
                <div className='training_others'>
                  <div onClick={ word_collect }> 收藏 </div>
                  <div onClick={ get_result }> help </div>
                  <div onClick={ ()=>word_get_mp3('word') }> <SoundFilled/> </div>
                  <div onClick={ training_next }> next </div>
                </div>
                <div className='training_result' ref={ result }>
                  <div>{ training_start.words[training_start.index].word } <SoundFilled onClick={ ()=>word_get_mp3('word', 'answer') }/></div>
                  <div>{ training_start.words[training_start.index].accent }</div>
                  <div>{ training_start.words[training_start.index].mean_cn }</div>
                  {
                    training_start.words[training_start.index].sentence_img!='undefined'&&training_start.words[training_start.index].sentence_img?
                    <div>
                      <img src={`${ url }/user_page/words/get_word_img?word=${ training_start.words[training_start.index].word }&path=${ training_start.words[training_start.index].path }&name=${ training_start.words[training_start.index].sentence_img }`}></img>
                    </div>:
                    <></>
                  }
                  <div>例句 : { training_start.words[training_start.index].sentence } <SoundFilled onClick={ ()=>word_get_mp3('sentence', 'answer') }/></div>
                  <div>中文 : { training_start.words[training_start.index].sentence_trans }</div>
                  <div>
                    <img src={`${ url }/user_page/words/get_word_img?word=${ training_start.words[training_start.index].word }&path=${ training_start.words[training_start.index].path }&name=${ training_start.words[training_start.index].word_img }`}></img>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      </div>
    </div>
  )
}

export default connect((state)=>({
  account : state.account,
  cet_4 : state.cet_4,
  cet_6 : state.cet_6,
  tem_4 : state.tem_4,
  tem_8 : state.tem_8
}),
{
  login : all_actions.login,
  cet_4_update : all_actions.cet_4_update,
  cet_6_update : all_actions.cet_6_update,
  tem_4_update : all_actions.tem_4_update,
  tem_8_update : all_actions.tem_8_update
})(Train);