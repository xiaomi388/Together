import React from 'react'

import TButton from './Button'

import undraw_synchronize_ccxk from '../assets/undraw_synchronize_ccxk.png'
import logo from '../assets/logo.png'
import bg_top from '../assets/bg-top.png'

import '../styles/home.css'
import {Button} from 'antd';

class Home extends React.Component {
  constructor({history}) {
    super()
    this.history = history
  }

  goToRoomInput = (e, history) => {
    this.history.push('/gotoroom')
  }

  render() {
    return (
      <div className='home-wrapper'>
        <div className="header-container">
          <img src={bg_top} className='bg-top'/>
          <img src={logo} className='logo'/>
        </div>

        <div className="main-container">
          <div className="main-left">
            <div className='intro-wrapper'>
              <p className='main-intro'>
                Watch Videos Together <br/>
                With Your Friend.<br/>
                <span className='intro-purple'>Remotely, Simultaneously.</span>
              </p>
              <p className='sub-intro'>
                <span className='intro-purple'>Together</span> allows you to watch videos in sync with
                friends who are far away and share your real-time
                thoughts via live chat in the same space.
                <br/>
                <br/>
                Link up with your friend by creating your space NOW!
              </p>
            </div>

              <TButton style={{width: "30rem"}} value='Create Your Space' onClick={this.goToRoomInput}/>
          </div>

          <div className="main-right">
            <div className="main-right-img-wrapper">
              <img src={undraw_synchronize_ccxk} className='undraw_synchronize_ccxk'/>
              <img className='undraw_synchronize_ccxk'/>
            </div>
          </div>

        </div>


        <div className="footer-container">
          <div className='boarder'/>
          <div className='footer'>© 2019 Together - Made with <span className="red">♥</span> by Eden & Freda</div>
        </div>
      </div>
    )
  }
}

export default Home