import React from 'react'
import '../styles/button.css'

import btn_bg_1 from '../assets/btn-bg-1.png'

class TButton extends React.Component {
  render() {
    return (
      <div onClick={this.props.onClick} className='btn-bg-1-wrapper'>
        <img className='btn-bg-1' src={btn_bg_1}/>
        <div className='btn-bg-1-text'>
          <span> {this.props.value}</span>
        </div>
      </div>
    )
  }
}

export default TButton;