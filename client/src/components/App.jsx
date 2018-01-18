import React from 'react';
import axios, { post } from 'axios';
import { connect, sendMessage } from '../socketHelpers';
import { Input, Button, Popover, PopoverHeader, PopoverBody } from 'reactstrap';
import NavBar from './NavBar.jsx';
import MessageList from './MessageList.jsx';
import Body from './Body.jsx';
import SendFiles from './SendFiles.jsx';

// The main component of the App. Renders the core functionality of the project.
export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // Default message informs the user to select a workspace
      messages: [
        {
          text: 'Welcome to slackk-casa! Please select or create a workspace!',
          username: 'Slack-bot',
          id: 0,
          createdAt: new Date(),
          workspaceId: 0,
        },
      ],
      users: [],
      workSpaces: [],
      file: null,
      query: '',
      currentWorkSpaceId: 0,
      currentWorkSpaceName: '',
      currentlyTyping: false,
    };

    this.timer = null;

    // this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    const server = location.origin.replace(/^http/, 'ws');
    // connect to the websocket server
    connect(server, this);
  }

  handleFileChange(e) {
    this.setState({ file: e.target.files[0] });
  }

  handleFileSubmit(event) {
    event.preventDefault();
    let { file } = this.state;
    this.fileUpload(file)
      .then((response) => {
        console.log('success!');
        sendMessage({
          username: this.props.location.state.username,
          text: response.data,
          workspaceId: this.state.currentWorkSpaceId,
        });
      });
  }
  // fileUpload function thanks to Ashik Nesin: https://github.com/AshikNesin/axios-fileupload
  fileUpload(file) {
   const url = '/upload';
   const formData = new FormData();
   formData.append('file',file)
   const config = {
       headers: {
        'content-type': 'multipart/form-data'
       }
   }
   return post(url, formData, config)
 }
  // changes the query state based on user input in text field
  handleChange(event) {
    // clear any timers set reset currentlyTyping
    clearTimeout(this.timer);
    // changes the query state based on user input in text field
    // sets user as currently typing.
    this.setState({
      query: event.target.value,
      currentlyTyping: true,
    });
    // set a timer to reset currentlyTyping state.
    this.timer = setTimeout(this.turnOffTyping.bind(this), 3000);
  }

  // sends message on enter key pressed and clears form
  // only when shift+enter pressed breaks to new line
  handleKeyPress(event) {
    // on key press enter send message and reset text box
    if (event.charCode === 13 && !event.shiftKey) {
      event.preventDefault();
      sendMessage({
        username: this.props.location.state.username,
        text: this.state.query,
        workspaceId: this.state.currentWorkSpaceId,
        isImage: false,
        workspaceMembers: [],

      });
      // resets text box to blank string
      this.setState({
        query: '',
      });
    }
  }

  // grabs all existing workspaces
  loadWorkSpaces() {
    fetch('/workspaces')
      .then(resp => resp.json())
      .then(workSpaces => this.setState({ workSpaces }))
      .catch(console.error);
  }



  // Helper function to reassign current workspace
  changeCurrentWorkSpace(id, name) {
    this.setState({ currentWorkSpaceId: id, currentWorkSpaceName: name });

    axios.get(`/workspaces/${id}/members`)
      .then(data => this.setState({ workspaceMembers: data.data }))
  }
  // renders nav bar, body(which contains all message components other than input), and message input
  render() {
    const {
      messages, query, workSpaces,
      currentWorkSpaceId, currentWorkSpaceName, workspaceMembers
    } = this.state;
    return (
      <div className="app-container">
        <NavBar
          currentWorkSpaceName={currentWorkSpaceName}
          currentWorkSpaceId={currentWorkSpaceId}
          currentUser={this.props.location.state.username}
          workspaceMembers={workspaceMembers}
        />
        <Body
          messages={messages}
          workSpaces={workSpaces}
          loadWorkSpaces={() => this.loadWorkSpaces()}
          changeCurrentWorkSpace={(id, name) => this.changeCurrentWorkSpace(id, name)}
          currentWorkSpaceId={currentWorkSpaceId}
          currentUser={this.props.location.state.username}
          workspaceMembers={workspaceMembers}
        />
        <div className="input-container">
          <SendFiles fileSubmit={this.handleFileSubmit.bind(this)} change={this.handleFileChange.bind(this)}/>

          <Input
            value={query}
            className="message-input-box"
            type="textarea"
            name="text"
            placeholder={`Message #${currentWorkSpaceName || 'select a workspace!'}`}
            onChange={event => this.handleChange(event)}
            onKeyPress={event => this.handleKeyPress(event)}
          />
        </div>
      </div>
    );
  }
}
