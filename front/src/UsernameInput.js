import React, { Component } from 'react';
import './UsernameInput.css';

export default class UsernameInput extends Component {
  constructor(props) {
    super(props);
    this.state = { username: '' };

    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.keyPressed = this.keyPressed.bind(this);
  }

  handleChange = (e) => {
    // console.log(e.target.value)
    this.setState({username: e.target.value});
  }

  handleClick = (e) => {
    console.log(this.state.username);
  }

  keyPressed(event) {
    if (event.key === "Enter") {
      console.log(this.state.username);
    }
  }

  render() {
    return (
      <div className="text-center welcome">
        <h1>Welcome Stranger !</h1>
        <h3>What's your name ?</h3>
        <div>
          <input onChange={this.handleChange} onKeyPress={this.keyPressed}/>
          <button className="btn" onClick={this.handleClick} >Enter</button>
        </div>
      </div>
    );
  }
}