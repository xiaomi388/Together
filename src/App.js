import React, { Component } from 'react';
import Room from './components/Room';
import './styles/room.css';
import './App.css';

import { BrowserRouter, Route } from 'react-router-dom';
import { GoToRoomInput } from './components/GoToRoomInput';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
       <React.Fragment>
          <Route path="/" exact component={GoToRoomInput}/>
          <Route path="/:roomId" exact component={Room}/>
        </React.Fragment>
      </BrowserRouter>
    )
  }
}

export default App;
