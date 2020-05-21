import React, { Component } from 'react';

export default class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = { username: '', room: "default" }
  }

  handleChange = (e) => {
    // console.log(e.target.value)
    this.setState({username: e.target.value});
  }

  handleClick = (e) => {
    console.log(this.state.username);
  }

  keyPressed(e) {
    if (e.key === "Enter") {
      console.log(this.state.username);
    }
  }

  render() {
    return (
      <div>Test</div>
    );
  }
}