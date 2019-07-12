import React, { Component } from 'react';
import Video from './components/Video';
import './styles/video.css';
import './App.css';

import {Layout} from 'antd';
import { BrowserRouter, Route } from 'react-router-dom';
import { GoToRoomInput } from './components/GoToRoomInput';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
       <React.Fragment>
          <Route path="/" exact component={GoToRoomInput}/>
          <Route path="/:roomId" exact component={Video}/>
        </React.Fragment>
      </BrowserRouter>
    )
  }
}

export default App;
