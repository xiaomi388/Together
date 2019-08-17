import React from 'react'

import undraw_synchronize_ccxk from '../assets/undraw_synchronize_ccxk.png'
import logo from '../assets/logo.png'
import bg_top from '../assets/bg-top.png'
import btn_bg_1 from '../assets/btn-bg-1.png'

import '../styles/home.css'

class Home extends React.Component {
  constructor() {
    super()
  }

  render() {
    return (
      <div className='home-wrapper'>
        <img src={bg_top} className='bg-top'></img>
        <img src={logo} className='logo'></img>
        <img src={undraw_synchronize_ccxk} className='undraw_synchronize_ccxk'></img>
        <img className='undraw_synchronize_ccxk'></img>

        <div className='intro-wrapper'>
          <p className='main-intro'>
            Watch Videos Together <br></br>
            With Your Friend.<br></br>
            <span className='intro-purple'>Remotely, Simultaneously.</span>
          </p>
          <p className='sub-intro'>
            <span className='intro-purple'>Together</span> allows you to watch videos in sync with 
            friends who are far away and share your real-time 
            thoughts via live chat in the same space.
            <br></br>
            <br></br>
            Link up with your friend by creating your space NOW!
          </p>
        </div>

        <div className='btn-bg-1-wrapper'>
          <img className='btn-bg-1' src={btn_bg_1}></img>
          {/* <span>Create Your Space</span> */}
          <span className='btn-bg-1-text'>Create Your Space</span>
        </div>

        <div className='boarder'></div>
        <div className='footer'>© 2019 Together - Made with ♥ by Eden & Freda</div>
      </div>
    )
  }
}

export default Home