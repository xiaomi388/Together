import React from 'react'

import { Input, Button, Icon } from 'antd'
import ReactPlayer from 'react-player'

import '../styles/cinemaWidget.css'

class CinemaWidget extends React.Component {
    constructor() {
        super()
        this.state = {
            videoUrl: '',
            videoPlaying: false,
            videoInputUrl: '',
            isListeningPlayer: true,
            handlePlayerEvent: this.handlePlayerEvent
        }
        this.videoPlayer = null
        this.inputRef = null
    }


    handlePlayerData = (dataObj) => {
        if (dataObj.content.action == 'play') {
            this.setState({videoPlaying: true})
            
            /* Judge: if currentTime is very close to peer.currentTime,
            ** then stop seeking to this time, 
            ** otherwise packets will be sent back and forth.
            ** This is because when seeks the video on YouTube,
            ** the video will first be stopped, and then be started. */
            if (Math.abs(this.videoPlayer.getCurrentTime() - dataObj.content.currentTimeSec) > 1) {
                this.videoPlayer.seekTo(dataObj.content.currentTimeSec)
            }
        }  else if (dataObj.content.action == 'pause') {
            this.setState({videoPlaying: false})
            if (Math.abs(this.videoPlayer.getCurrentTime() - dataObj.content.currentTimeSec) > 1) {
                this.videoPlayer.seekTo(dataObj.content.currentTimeSec)
            }
        } 
    }

    handlePlayerEvent = (event, action) => {
        if (this.state.videoPlaying != 'pause' && action == 'pause') {
            this.setState({videoPlaying: false})
        } else if (this.state.videoPlaying != 'play' && action == 'play') {
            this.setState({videoPlaying: true})
        }
        var data = {
            type: 'player',
            content: {
                currentTimeSec: this.videoPlayer.getCurrentTime(),
                action: action
            }
        }
        this.props.sndData(JSON.stringify(data))
    }

    fileInputOnChange = (e) => {
        const file = e.target.files[0]
        console.log(file)
        if(file) this.setState({videoUrl: URL.createObjectURL(file)})
        e.target.value = '' // restore to the original status.
    }
    handleVideoURLInput = (event) => {
        console.log(event.target.value)
        this.setState({videoInputUrl: event.target.value})
    }

    render() {
        return (<div className="cinemaWidgetInnerWrapper">
            <div className="header">
                <img className="logo" src={require('../assets/logo.png')} alt="logo" />
            </div>
            <div className="playerWrapper">
                <ReactPlayer className="player" url={this.state.videoUrl}
                    playing={this.state.videoPlaying} controls={true}
                    ref={player => { this.videoPlayer = player }}
                    onPlay={ e => this.handlePlayerEvent(e, 'play')}
                    onPause={ e =>this.handlePlayerEvent(e, 'pause') }
                />
            </div>
            <div className="info">Play video from...</div>
                <div className="controlPanelWrapper">
                    <div className="link">
                        <Input 
                            size= "large"
                            prefix={<Icon type="link" style={{ color: '#6C63FF' }} />}
                            placeholder="Paste URL from YouTube" 
                            allowClear 
                            onChange={e => this.handleVideoURLInput(e)} />
                        <Button id="btn-go" type="primary" 
                            size= "large" 
                            onClick={e => this.setState({ videoUrl: this.state.videoInputUrl })}>
                            <Icon type="caret-right" style={{ fontSize: '24px', color: '#fff' }}/>
                        </Button>
                    </div>
                    <div className="local">
                        <Button id="btn-file" type="primary" 
                            size= "large"
                            icon="file"
                            onClick={e => this.inputRef.click()}>Select Local Video</Button>
                        <input type="file" name="file" onChange={this.fileInputOnChange} style={{ display: 'none' }} ref={e => this.inputRef = e} />
                    </div>
                </div>
        </div>)
    }
}

export default CinemaWidget