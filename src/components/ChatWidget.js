import React from 'react'
import '../styles/chatWidget.css'

import { Input, Layout, Button } from 'antd'

const ConnectedStatus = {
  UNCONNECTED: 'unconnected',
  HOST_WAITING: 'waiting for the guest',
  GUEST_WAITING: 'waiting for the host',
  HOST_CONNECTED: 'connected to the guest',
  GUEST_CONNECTED: 'connected to the host',
  CONNECTING: 'connecting to the peer',
  FULL: 'the room is full'
}

class ChatWidget extends React.Component {
  constructor() {
    super()
    this.state = {
      chatInputValue: '',
      localUserName: '...',
      remoteUserName: '...',
      inputVisible: false
    }
  }

  handleChatInput = (event) => {
    this.setState({
      chatInputValue: event.target.value
    })
  }
  
  componentDidMount() {
    if (this.props.localStream) {
      this.localVideo.srcObject = this.props.localStream
    }
    if (this.props.remoteStream) {
      this.localVideo.srcObject = this.props.remoteStream
    }
  }

  setVideoStream(stream, isLocal=true) {
    if (isLocal) {
      this.localVideo.srcObject = stream
    } else {
      this.remoteVideo.srcObject = stream
    }
  }

  inputAreaOnKeyDown = (e) => {
    if (e.keyCode === 13) {
      this.props.sndMsg(this.state.chatInputValue)
    }
  }

  refreshMsgBox = () => {
    var element = document.getElementsByClassName("msgBox")[0]
    element.scrollTop = element.scrollHeight
  }

  handleNameInput = (e) => {
    this.props.sndNewName(e.target.value)
    this.setState({ inputVisible: false})
  }
  
  showNameInput = (e) => {
    this.setState({ inputVisible: true})
  }

  setUserName = (localUserName=null, remoteUserName=null) => {
    if (localUserName) {
      this.setState({localUserName, localUserName})
    }
    if (remoteUserName) {
      this.setState({remoteUserName, remoteUserName})
    }

  }

  getUserName = () => {
    return [this.state.localUserName, this.state.remoteUserName]
  }

  renderChatItem = (data) => {
    if (data.isLocal) {
      return (
        <div className="chatItem localChatItem">
          {data.content}
        </div>
      )
    } else {
      return (
        <div className="chatItem remoteChatItem">
          {data.content}
        </div>
      )
    }
  }

  render() {
    return (
      <div className="chatWidgetInnerWrapper">
        <div className="cameraArea">
          <div className="remoteCameraArea">
            <p className="nameLabel">{this.state.remoteUserName}</p>
            <video autoPlay playsInline id="remoteVideo" ref={video => (this.remoteVideo = video)}></video>
          </div>
          <div className="localCameraArea">
            {this.state.inputVisible ? (
              <Input className="nameInput" value={this.state.localUserName} onChange={e => this.setState({localUserName: e.target.value}) } onBlur={ e => this.handleNameInput(e) } />
            ) : null}
            <p className="nameLabel localLabel" onClick={ e => this.showNameInput(e) }>{this.state.localUserName}</p>
            <Button className="toggleCamera" shape="circle" type="primary" icon="video-camera" onClick={this.props.toggleCamera} ></Button>
            <video autoPlay playsInline id="localVideo" muted ref={video => (this.localVideo = video)}></video>
          </div>
        </div>
        <p className="status"> Current Status: {this.props.currentState} </p>

        <div className="msgBox" >
          {this.props.msgBoxData.map(this.renderChatItem)}
        </div>

        <div className="inputArea">
            <Input id="inputBox" 
                size= "large"
                placeholder="Type a message here..." 
                value={this.state.chatInputValue}
                onChange={ e => this.handleChatInput(e)}
                onPressEnter = {(e) => { 
                  var msg = this.state.chatInputValue
                  this.props.sndMsg(msg) 
                  this.setState({chatInputValue: ''})
                }} />
        </div>
      </div>
    )
  }
}

export default ChatWidget
