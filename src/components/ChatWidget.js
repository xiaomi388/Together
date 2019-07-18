import React from 'react'
import '../styles/chatWidget.css'

import { Input, Layout, Button } from 'antd'

class ChatWidget extends React.Component {
    constructor() {
        super()
        this.state = {
            chatInputValue: '',
            msgBoxData: [],
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

    setVideoStream(localStream, remoteStream) {
        if (localStream) {
            this.localVideo.srcObject = localStream
        }
        if (remoteStream) {
            this.remoteVideo.srcObject = remoteStream
        }
    }

    render() {
        return (
            <div className="chatWidgetInnerWrapper">
                <div className="cameraArea">
                    <video autoPlay id="localVideo" muted ref={video => (this.localVideo = video)}></video>
                    <video autoPlay id="remoteVideo" ref={video => (this.remoteVideo = video)}></video>
                    <p>{this.props.test}</p>
                </div>


                <div className="msgBox" >
                    {this.props.msgBoxData.map((data) => (
                        <p>{data}</p>
                    ))}
                </div>

                <div className="inputArea">
                    <Input style={{ width: '70%' }} onChange={ e => this.handleChatInput(e) } />
                    <Button style={{ width: '30%' }} type="primary" onClick={(e) => this.props.sndMsg(this.state.chatInputValue)}>Send</Button>
                </div>
            </div>
        )
    }
}

export default ChatWidget