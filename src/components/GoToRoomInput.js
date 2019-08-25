import React, { useState } from 'react'
import shortId from 'shortid'
import '../styles/goToRoomInput.css'

import TButton from './Button'

import { message, Input, Icon } from 'antd'
import logo from '../assets/logo.png'
import bg_top from '../assets/bg-top.png'
import undraw_link_shortener_mvf6 from '../assets/undraw_link_shortener_mvf6.png'

const goToRoom = (history, roomId) => {
  history.push(`/room/${roomId}`)
}



class GoToRoomInput extends React.Component {
  constructor({history}) {
    super()
    this.history = history
    this.roomId = shortId.generate()
    this.linkRef = null
  }

  onClickCopyButton = (e) => {
    navigator.clipboard.writeText(this.linkRef.state.value)
    message.success('The shared link has been copied to your clipboard!');
  }


  getCopyButton = () => {
    return (
      <div onClick={this.onClickCopyButton} className='link-copy-button'>
        <Icon type='copy'></Icon>
      </div>
    )
  }
  
  render() {
    return (<div className="enter-room-container">
      <img src={bg_top} className='bg-top'></img>
      <img src={logo} onClick={e => window.location.href = '/'}  className='logo'></img>
      <img src={undraw_link_shortener_mvf6} className='undraw_link_shortener_mvf6'></img>

      <p className="title">You’ve created a new space!</p>
      <p className="subtitle">Now, invite your friend to this space by sharing this link.</p>
      <div className="link-wrapper">
        <Input ref={e => this.linkRef = e} readOnly addonAfter={this.getCopyButton()} className='link-input' value={`${window.location.protocol}//${window.location.host}/room/${this.roomId}`}></Input>
        {/* <div className='link-copy-button'></div> */}
      </div>
      <div className="roominput-btn-wrapper">
        <TButton value='Enter Your Space' addonAfter={<Icon type="arrow-right" />} onClick={ () => goToRoom(this.history, this.roomId)}></TButton>
      </div>

      {/* <form>
            <input type="text" value={roomId} placeholder="Room id" onChange={(event) => {
              setRoomId(event.target.value)
            }}/>
            <button onClick={() => {
              goToRoom(history, roomId)
            }}>Enter</button>
            </form> */}
      </div>)
  }
}

export default GoToRoomInput;