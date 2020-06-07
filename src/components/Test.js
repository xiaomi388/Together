import React from 'react'
import ReactPlayer from "react-player";
import Tencent from "../players/Tencent";

class Test extends React.Component {
  constructor({history}) {
    super();
    this.history = history
    ReactPlayer.addCustomPlayer(Tencent);
  }

  render() {
    return (
      <div className='test'>
        <ReactPlayer url="https://www.youtube.com/watch?v=WMvYTKbdp8o"/>
        <ReactPlayer url="https://v.qq.com/x/page/z0915ozsyli.html"/>
      </div>
    )
  }
}

export default Test
