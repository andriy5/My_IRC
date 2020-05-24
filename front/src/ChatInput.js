import React, { Component } from 'react';
import { sendMessage } from './Api';
import $ from 'jquery';
import './ChatInput.css';


export default class ChatInput extends Component {
  constructor(props) {
    super(props);
    // let username = this.props.username;
    this.state = { nickname: '', room: "default", value:''}

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.keyPressed = this.keyPressed.bind(this);
  }

  handleChange = (e) => {
    // console.log(e.target.value)
    this.setState({value: e.target.value});
  }

  handleSubmit = (e) => {
    e.preventDefault();
    console.log("username", this.props.username);
    $('#textbox').val('');
    this.setState({value: ''});
    sendMessage(this.state.value, this.props.username, this.state.room)
  }

  keyPressed = (e) => {
    if (e.key === "Enter" && e.shiftKey === false) {
      e.preventDefault();
      $('#textbox').val('');
      this.setState({value: ''});
      console.log(this.state);
      sendMessage(this.state.value, this.props.username, this.state.room)
    }
  }

  render() {
    return (
      <div className="chat">
        <ul id="messages"></ul>
        <form onSubmit={this.handleSubmit}>
            <textarea id='textbox' 
            placeholder="Write your message here"
            value={this.state.value} 
            onChange={this.handleChange} 
            onKeyPress={this.keyPressed} 
            />
            <input type="submit" value="Submit" />
        </form>
      </div>
    );
  }
}