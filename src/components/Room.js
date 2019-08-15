import React from 'react'
import PeerConstrutor from '../helpers/simple-peer'
import '../styles/room.css'
import io from 'socket.io-client'
import { Layout } from 'antd'
import ChatWidget from './ChatWidget'
import CinemaWidget from './CinemaWidget'
const { Header, Content } = Layout

class Room extends React.Component {
    constructor() {
        super()
        this.state = {
            initiator: false,
            peer: {},
            full: false,
            test: "helloworld",
            localStream: null,
            msgBoxData: []
        }
        this.chatWidgetRef = null
        this.cinemaWidgetRef = null
    }

    connectToSignalServer = () => {
        const socket = io(process.env.REACT_APP_SIGNALING_SERVER)
        this.setState({ socket })
        const { roomId } = this.props.match.params
        socket.on('init', () => {
            this.setState({ initiator: true })
        })
        socket.on('ready', () => {
            this.enter(roomId)
        })
        socket.on('desc', (data) => {
            console.log(data)
            if (data.type === 'offer' && this.state.initiator) return
            if (data.type === 'answer' && !this.state.initiator) return
            console.log('start call!')
            this.state.peer.signal(data)
        })
        socket.on('disconnected', () => {
            this.setState({ initiator: true })
        })
        socket.on('full', () => {
            this.setState({ full: true })
        })
        socket.emit('join', { roomId: roomId })
    }


    componentDidMount() {
        this.getUserMedia().then(this.connectToSignalServer)
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
                this.setState({ localStream: stream })

                // FIXME: is there a better solution?
                this.chatWidgetRef.setVideoStream(stream, null)
                resolve()
            }, () => { })
        })
    }

    sndMsg = (msg) => {
        var data = {
            type: 'msg',
            content: msg
        }
        var joined = this.state.msgBoxData.concat([msg])
        this.setState({msgBoxData: joined})
        this.state.peer.send(JSON.stringify(data))
    }

    sndData = (data) => {
        this.state.peer.send(data)
    }

    registerPeerCallback(roomId) {
        var peer = this.state.peer
        const component = this
        peer.on('signal', data => {
            const signal = {
                room: roomId,
                desc: data
            }
            component.state.socket.emit('signal', signal)
        })
        peer.on('stream', stream => {
            // FIXME: is there a better solution?
            this.chatWidgetRef.setVideoStream(null, stream)
        })
        peer.on('error', function (err) {
            console.log(err)
        })
        peer.on('data', data => {
            var dataObj = JSON.parse(data)
            if (dataObj.type == 'msg') {
                var joined = this.state.msgBoxData.concat([dataObj.content])
                this.setState({msgBoxData: joined})
            } else if (dataObj.type == 'player') {
                this.cinemaWidgetRef.handlePlayerData(dataObj)
            }
        })
    }

    enter = (roomId) => {
        var peerConstructor = new PeerConstrutor()
        const peer = peerConstructor.init(this.state.localStream, this.state.initiator)
        this.setState({ peer })
        this.registerPeerCallback(roomId)
    }

    renderFull = () => {
        if (this.state.full) {
            return 'The room is full'
        }
    }

    render() {
        return (
            <Layout className="layout" style={{ minHeight: "100vh", maxHeight: "100vh" }}>
                <Content className="content">
                    <div className="cinemaWidgetWrapper">
                        <CinemaWidget 
                            peer={this.state.peer} 
                            sndData={this.sndData}
                            ref={e => this.cinemaWidgetRef = e}
                            ></CinemaWidget>
                    </div>
                    <div className="chatWidgetWrapper">
                        <ChatWidget 
                            msgBoxData={this.state.msgBoxData}
                            peer={this.state.peer} 
                            userMediaOnGotten={this.userMediaOnGotten} 
                            sndMsg={this.sndMsg}
                            localStream={this.state.localStream}
                            test={this.state.test}
                            ref={e => this.chatWidgetRef = e}
                            remoteStream={this.state.remoteStream}>
                        </ChatWidget>
                    </div>
                </Content>
            </Layout>
        )
    }
}

export default Room