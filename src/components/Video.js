import React from 'react'
import VideoCall from '../helpers/simple-peer'
import '../styles/video.css'
import io from 'socket.io-client'
import { List, Typography, Input, Layout, Row, Col, Button } from 'antd'
import InfiniteScroll from 'react-infinite-scroller';
import AnyHeight from 'react-list-any-height'
import ReactList from 'react-list';
import ReactPlayer from 'react-player';
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
            chattingInputValue: '',
            videoUrl: '',
            videoPlaying: false,
            videoInputUrl: ''
        }
        this.videoPlayer = null
        this.sndMsg = this.sndMsg.bind(this);
        this.inputRef = null
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
            console.log('rec msg from peer:')
            console.log(JSON.parse(data))
            data = JSON.parse(data)
            if (data.type == 'msg') {
                var joined = this.state.msgBoxData.concat([data.content])
                console.log(joined)
                this.setState({msgBoxData: joined})
            } else if (data.type == 'playerOnPlay') {
                var bak = this.handleOnPlay 
                this.handleOnPlay = (e) => {}
                this.videoPlayer.seekTo(data.content)
                if (this.state.videoPlaying == false) {
                    this.setState({videoPlaying: true}, () => {
                        this.handleOnPlay = bak
                    })
                }
            } else if (data.type == 'playerOnPause') {
                // this.videoPlayer.seekTo(data.content) 
                var bak = this.handleOnPlay 
                this.handleOnPlay = (e) => {}
                this.videoPlayer.seekTo(data.content)
                if (this.state.videoPlaying == true) {
                    this.setState({videoPlaying: false}, () => {
                        this.handleOnPlay = bak
                    })
                }
            } else if (data.type == 'playerOnSeek') {
                this.videoPlayer.seekTo(data.content)
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
    handleOnPause = (event) => {
        console.log('send on pause')
        var data = {
            type: "playerOnPause",
            content: this.videoPlayer.getCurrentTime()
        }
        this.state.peer.send(JSON.stringify(data))
    }

    handleOnPlay = (event) => {
        console.log('send on play')
        var data = {
            type: "playerOnPlay",
            content: this.videoPlayer.getCurrentTime()
        }
        this.state.peer.send(JSON.stringify(data))
    }
    fileInputOnChange = (e) => {
        const file = e.target.files[0]
        console.log(file)
        if(file) this.setState({videoUrl: URL.createObjectURL(file)})
        e.target.value = '' // 上传之后还原
    }
    handleVideoURLInput = (event) => {
        console.log(event.target.value)
        this.setState({videoInputUrl: event.target.value})
    }

    render() {
        return (
            <Layout className="layout" style={{ minHeight: "100vh", maxHeight: "100vh" }}>
                <Header className="header">Together v0.0.1</Header>
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
                        <div className="playerWrapper">
                            <ReactPlayer className="player" url={this.state.videoUrl} 
                                playing={this.state.videoPlaying} controls={true} 
                                ref={player => {this.videoPlayer = player}} 
                                onPlay={this.handleOnPlay}
                                onPause={this.handleOnPause}
                                />
                        </div>
                        <div className="controlPanelWrapper">
                            <Button type="primary" onClick={ e => this.inputRef.click()}>Select Local Video</Button>
                            <input type="file" name="file" onChange={this.fileInputOnChange} style={{display:'none'}} ref={ e => this.inputRef = e}/>

                            <Input onChange={ e => this.handleVideoURLInput(e) } />
                            <Button type="primary" onClick={ e => this.setState({videoUrl: this.state.videoInputUrl})}>Load From URL</Button>

                            {/* <Button onClick={e => console.log(this.videoPlayer.getCurrentTime())}></Button> */}
                        </div>
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
                {/* <Footer className="footer" >This is foot</Footer> */}

            </Layout>

        )
    }
}

export default Video