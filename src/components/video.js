import React from 'react'
import VideoCall from '../helpers/simple-peer'
import '../styles/video.css'
import io from 'socket.io-client'
import { List, Typography, Input, Layout, Row, Col, Button } from 'antd'
import InfiniteScroll from 'react-infinite-scroller';
import AnyHeight from 'react-list-any-height'
import ReactList from 'react-list';
const { Header, Footer, Sider, Content } = Layout;

class Video extends React.Component {
    constructor() {
        super()
        this.state = {
            localStream: {},
            remoteStreamUrl: '',
            streamUrl: '',
            initiator: false,
            peer: {},
            full: false,
            msgBoxData: [
            ],
            chattingInputValue: ''
        }

        this.sndMsg = this.sndMsg.bind(this);
    }
    videoCall = new VideoCall()
    componentDidMount() {
        const socket = io(process.env.REACT_APP_SIGNALING_SERVER)
        const component = this
        this.setState({ socket })
        const { roomId } = this.props.match.params
        this.getUserMedia().then(() => {
            socket.emit('join', { roomId: roomId })
        })
        socket.on('init', () => {
            component.setState({ initiator: true })
        })
        socket.on('ready', () => {
            component.enter(roomId)
        })
        socket.on('desc', (data) => {
            console.log(data)
            if (data.type === 'offer' && component.state.initiator) return
            if (data.type === 'answer' && !component.state.initiator) return
            console.log('start call!')
            component.call(data)
        })
        socket.on('disconnected', () => {
            component.setState({ initiator: true })
        })
        socket.on('full', () => {
            component.setState({ full: true })
        })

    }
    getUserMedia(cb) {
        return new Promise((resolve, reject) => {
            navigator.getUserMedia = navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
            const op = {
                video: {
                    width: { min: 160, ideal: 640, max: 1280 },
                    height: { min: 120, ideal: 360, max: 720 },
                },
                audio: true
            }
            navigator.getUserMedia(op, stream => {
                this.setState({ streamUrl: stream, localStream: stream })
                this.localVideo.srcObject = stream
                resolve()
            }, () => { })
        })
    }
    enter = (roomId) => {
        const peer = this.videoCall.init(this.state.localStream, this.state.initiator)
        this.setState({ peer })
        peer.on('signal', data => {
            const signal = {
                room: roomId,
                desc: data
            }
            this.state.socket.emit('signal', signal)
        })
        peer.on('stream', stream => {
            this.remoteVideo.srcObject = stream
        })
        peer.on('error', function (err) {
            console.log(err)
        })
        peer.on('data', data => {
            console.log(JSON.parse(data))
            data = JSON.parse(data)
            if (data.type == "msg") {
                var joined = this.state.msgBoxData.concat([data.content])
                console.log(joined)
                this.setState({msgBoxData: joined})
            }
        })
    }
    sndMsg = (msg) => {
        var joined = this.state.msgBoxData.concat([msg.content])
        console.log(joined)
        this.setState({msgBoxData: joined})
        this.state.peer.send(JSON.stringify(msg))

        
    }
    call = (otherId) => {
        this.videoCall.connect(otherId)
    }
    renderFull = () => {
        if (this.state.full) {
            return 'The room is full'
        }
    }
    handleChattingInput = (event) => {
        this.setState({
            chattingInputValue: event.target.value
        })
    }
    render() {
        return (
            <Layout className="layout" style={{ minHeight: "100vh", maxHeight: "100vh" }}>
                <Header className="header">Test</Header>
                <Content className="content">
                    <div className="chatCol">
                        <div className="cameraArea">
                            <video autoPlay id="localVideo" muted ref={video => (this.localVideo = video)}></video>
                            <video autoPlay id="remoteVideo" ref={video => (this.remoteVideo = video)}></video>
                        </div>


                        <div className="msgBox" >
                            {this.state.msgBoxData.map((data) => (
                                <p>{data}</p>
                            ))}
                        </div>

                        <div className="inputArea">
                            <Input style={{ width: '70%' }} onChange={ e => this.handleChattingInput(e) } />
                            <Button style={{ width: '30%' }} type="primary" onClick={(e) => this.sndMsg({ type: 'msg', content: this.state.chattingInputValue })}>Send</Button>
                        </div>


                    </div>

                    <div className="videoCol">

                    </div>
                    {/* <Row className="content">
                        <Col span={4} className="chatColumn">
                            <Row style={{flex: 1}}>
                            </Row>

                            <Row gutter={4} className="inputArea" style={{flex: 1}}>
                                <Col span={17}>
                                </Col>
                                <Col span={7}>
                                </Col>
                            </Row>
                            {this.renderFull()}
                        </Col>
                        <Col span={20} ><p>helloworld</p></Col>
                    </Row>
                    <div className="push"></div> */}
                </Content>
                <Footer className="footer" style={{ backgroundColor: "#031529" }}>This is foot</Footer>

            </Layout>

        )
    }
}

export default Video