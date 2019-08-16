import React from 'react'
import '../styles/chatWidget.css'

import { Input, Layout, Button } from 'antd'

class ChatWidget extends React.Component {
    constructor() {
        super()
        this.state = {
            chatInputValue: '',
            msgBoxData: [],
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
                    {this.props.msgBoxData.map((data) => (
                        <p>{data}</p>
                    ))}
                </div>

                <div className="inputArea" onKeyDown={this.inputAreaOnKeyDown}>

                    <Input style={{ width: '70%' }} onChange={ e => this.handleChatInput(e) } />
                    <Button style={{ width: '30%' }} type="primary" onClick={(e) => this.props.sndMsg(this.state.chatInputValue)}>Send</Button>

                </div>
            </div>
        )
    }
}

export default ChatWidget