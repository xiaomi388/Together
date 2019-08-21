import React from 'react'
import '../styles/chatWidget.css'

import { Input, Layout, Button } from 'antd'

class ChatWidget extends React.Component {
  constructor() {
    super()
    this.state = {
      chatInputValue: '',
      localUserName: '',
      remoteUserName: ''
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
    this.setState({localUserName: e.target.value})
    this.props.sndNewName(e.target.value)
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
        <div className="localChatItem">
          {data.name}: {data.content}
        </div>
      )
    } else {
      return (
        <div className="remoteChatItem">
          {data.name}: {data.content}
        </div>
      )
    }
  }

  render() {
    return (
      <div className="chatWidgetInnerWrapper">
        <div className="cameraArea">
          <div className="localCameraArea">
            <Button style={{ width: '100%'}} type="primary" onClick={this.props.switchCamera} >Turn On/Off Camera</Button>
            <Input value={this.state.localUserName} onChange={ e => this.handleNameInput(e) } />
            <video autoPlay id="localVideo" muted ref={video => (this.localVideo = video)}></video>
          </div>

          <div className="remoteCameraArea">
            <Input value={this.state.remoteUserName} disabled />
            <video autoPlay id="remoteVideo" ref={video => (this.remoteVideo = video)}></video>
          </div>
        </div>


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