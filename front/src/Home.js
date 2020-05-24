import React, { Component } from 'react';
import './Home.css';
import { ConnectionToSocket } from './Api';
import ChatInput from './ChatInput';


export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = { username: '', room: "default" };

    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.keyPressed = this.keyPressed.bind(this);
  }

  handleChange = (e) => {
    this.setState({username: e.target.value});
  }

  handleClick = (e) => {
    ConnectionToSocket(this.state.username, this.state.room);
  }

  keyPressed = (event) => {
    if (event.key === "Enter") {
      ConnectionToSocket(this.state.username, this.state.room);
    }
  }
  
  render() {
    const username = this.state.username;
    return (
      <>
      <div className="text-center welcome">
        <h1>Welcome Stranger !</h1>
        <h3>What's your name ?</h3>
        <div>
          <input onChange={this.handleChange} onKeyPress={this.keyPressed}/>
          <button className="btn" onClick={this.handleClick} >Enter</button>
        </div>
      </div>
      <ChatInput username={username}/>
      {/* <ChatInput username="username"/> */}
      </>
    );
  }
}