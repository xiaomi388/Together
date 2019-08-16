import React from 'react'
import PeerConstrutor from '../helpers/simple-peer'
import '../styles/room.css'
import io from 'socket.io-client'
import { Layout } from 'antd'
import ChatWidget from './ChatWidget'
import CinemaWidget from './CinemaWidget'
const { Header, Content } = Layout

const ConnectedStatus = {
    UNCONNECTED: 'unconnected',
    HOST_WAITING: 'waiting for the guest',
    GUEST_WAITING: 'waiting for the host',
    HOST_CONNECTED: 'connected to the host',
    GUEST_CONNECTED: 'connected to the guest'
}

class Room extends React.Component {
    constructor() {
        super()
        this.state = {
            initiator: false,
            peer: null,
            full: false,
            test: "helloworld",
            localStream: null,
            msgBoxData: [],
            connectedStatus: ConnectedStatus.UNCONNECTED,
        }
        this.chatWidgetRef = null
        this.cinemaWidgetRef = null
    }

    connectToSignalServer = () => {
        const socket = io(process.env.REACT_APP_SIGNALING_SERVER)
        this.setState({ socket })
        const { roomId } = this.props.match.params
        socket.on('init', () => {
            this.setState({ 
                initiator: true, 
                connectedStatus: ConnectedStatus.HOST_WAITING,
            })
            this.chatWidgetRef.setUserName('Host')
        })
        socket.on('ready', () => {
            this.enter(roomId)
            if (this.state.connectedStatus == ConnectedStatus.UNCONNECTED) {
                this.setState({
                    connectedStatus: ConnectedStatus.GUEST_WAITING,
                })
            this.chatWidgetRef.setUserName('Guest')
            }
        })
        socket.on('desc', (data) => {
            // If the message is sent by the peer itself, discard it.
            if (data.type === 'offer' && this.state.initiator) return
            if (data.type === 'answer' && !this.state.initiator) return
            this.state.peer.signal(data)
        })
        socket.on('disconnected', () => {
            this.setState({ 
                initiator: true, 
                connectedStatus: ConnectedStatus.HOST_WAITING,
            })
            this.chatWidgetRef.setUserName('Host')
        })
        socket.on('full', () => {
            this.setState({ full: true })
        })
        socket.emit('join', { roomId: roomId })
    }

    // New a peer object and register callback
    enter = (roomId) => {
        var peerConstructor = new PeerConstrutor()
        const peer = peerConstructor.init(this.state.localStream, this.state.initiator)
        this.setState({ peer })
        this.registerPeerCallback(roomId)
    }

    switchCamera = (e) => {
        console.log(this.state.localStream)
        if (this.state.localStream) {
            if (this.peer) {
                this.peer.removeStream(this.state.localStream)
            }
            if (this.state.localStream) {
                let tracks = this.state.localStream.getTracks();
                tracks.forEach(function(track) {
                    track.stop();
                });
            }
            this.chatWidgetRef.setVideoStream(null, null)
            this.setState({localStream: null})
        } else {
            this.getUserMedia(() => {
                this.peer.addStream(this.state.localStream)
            })
        }
    }


    registerPeerCallback(roomId) {
        var peer = this.state.peer
        const component = this

        /* Fired when the peer wants to send signaling data to the remote peer.
        ** Be sure to listen to this event immediately to avoid missing it. 
        ** For initiator: true peers, it fires right away. 
        ** For initatior: false peers, it fires when the remote offer is received. */
        peer.on('signal', data => {
            const signal = {
                room: roomId,
                desc: data
            }
            component.state.socket.emit('signal', signal)
        })
        peer.on('connect', () => {

            // Set connected status
            if (this.state.connectedStatus === ConnectedStatus.HOST_WAITING) {
                this.setState({connectedStatus: ConnectedStatus.HOST_CONNECTED})
            } else if (this.state.connectedStatus === ConnectedStatus.GUEST_WAITING) {
                this.setState({connectedStatus: ConnectedStatus.GUEST_CONNECTED})
            }

            // Send our name to the remote peer
            this.sndNewName(this.chatWidgetRef.getUserName()[0])

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
                var joined = this.state.msgBoxData.concat([ `${dataObj.name}: ${dataObj.content}`])
                this.setState({msgBoxData: joined}, this.chatWidgetRef.refreshMsgBox)
            } else if (dataObj.type == 'player') {
                this.cinemaWidgetRef.handlePlayerData(dataObj)
            } else if (dataObj.type == 'newname') {
                this.chatWidgetRef.setUserName(null, dataObj.content)
            }
        })
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

    isConnected = () => {
        if (this.state.connectedStatus == ConnectedStatus.HOST_CONNECTED || 
            this.state.connectedStatus == ConnectedStatus.GUEST_CONNECTED) {
            return true
        }
        return false
    }

    sndNewName = (name) => {
        if (!this.isConnected()) {
            return
        }
        var data = {
            type: 'newname',
            content: name,
        }
        this.state.peer.send(JSON.stringify(data))
    }

    sndMsg = (msg) => {
        if (!this.isConnected()) {
            return
        }
        var data = {
            type: 'msg',
            content: msg,
            name: this.chatWidgetRef.getUserName()[0]
        }
        var joined = this.state.msgBoxData.concat([`${this.chatWidgetRef.getUserName()[0]}: ${msg}`])
        this.setState({msgBoxData: joined}, this.chatWidgetRef.refreshMsgBox)
        this.state.peer.send(JSON.stringify(data))
    }

    sndData = (data) => {
        if (!this.isConnected()) {
            return
        }
        this.state.peer.send(data)
    }

    renderFull = () => {
        if (this.state.full) {
            return 'The room is full'
        }
    }

    render() {
        return (
            <Layout className="layout" style={{ minHeight: "100vh", maxHeight: "100vh" }}>
                <Header className="header">Together v0.0.2</Header>
                <Content className="content">
                    <div className="chatWidgetWrapper">
                        <ChatWidget 
                            msgBoxData={this.state.msgBoxData}
                            peer={this.state.peer} 
                            userMediaOnGotten={this.userMediaOnGotten} 
                            sndMsg={this.sndMsg}
                            sndNewName={this.sndNewName}
                            localStream={this.state.localStream}
                            test={this.state.test}
                            ref={e => this.chatWidgetRef = e}
                            switchCamera={this.switchCamera}
                            remoteStream={this.state.remoteStream}>
                        </ChatWidget>
                        <p style={{ color: "white"}} > Current Status: {this.state.connectedStatus} </p>
                    </div>
                    <div className="cinemaWidgetWrapper">
                        <CinemaWidget 
                            peer={this.state.peer} 
                            sndData={this.sndData}
                            ref={e => this.cinemaWidgetRef = e}
                            ></CinemaWidget>
                    </div>
                </Content>
            </Layout>
        )
    }
}

export default Room