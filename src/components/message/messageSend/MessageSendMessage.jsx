import React, { Component } from "react";
import PropTypes from "prop-types";
import Textarea from "react-textarea-autosize";
import uuid from "uuid";
import dayjs from "dayjs";
import { connect } from "react-redux";

// Components
import MessageSendFile from "./MessageSendFile";
// import MessageSendEmoji from "./MessageSendEmoji";

// Actions
import { sendMessageNow } from "../../../actions/Actions";

// Helpers
import { processText } from "../../../helpers/messageHelper";

class MessageSendMessage extends Component {
  static propTypes = {
    emoji: PropTypes.objectOf(PropTypes.any).isRequired,
    sendMessageNow: PropTypes.func.isRequired,
    messageLog: PropTypes.arrayOf(PropTypes.object).isRequired
  };

  state = {
    inputValue: "",
    cursorPosition: 0,
    readOnly: false
  };

  componentWillReceiveProps(nextProps) {
    const { emoji } = nextProps;
    const emojiCurrent = this.props.emoji;
    const isChecking = emoji.id !== emojiCurrent.id;

    if (isChecking) {
      const { inputValue, cursorPosition } = this.state;
      const newMoji = `${emoji.colons} `;
      const newVal =
        inputValue.slice(0, cursorPosition) +
        newMoji +
        inputValue.slice(cursorPosition);

      const newLen = newMoji.length + cursorPosition;
      this.setState({
        inputValue: newVal,
        cursorPosition: newLen
      });
    }
  }

  handleTypeEvent = e => {
    const isShift = e.nativeEvent.shiftKey;
    const isEnter = e.nativeEvent.keyCode === 13;
    const textValue = this.state.inputValue;

    if (isEnter && !isShift) {
      e.preventDefault();
      this.handleSendMessage(textValue);
    }
  };

  handleSendMessage = text => {
    const trimText = text.trim();

    const timeFull = dayjs().format("YYYY-MM-DD HH:mm:ss");
    const timeMin = dayjs().format("dddd, h:mm a");

    if (trimText) {
      this.setState({
        inputValue: ""
      });

      const { messageLog } = this.props;
      const sender = Math.random() >= 0.5;
      const { processArray, onlyEmojy } = processText(text, sender);
      const msgObj = {
        key: uuid(),
        id: uuid(),
        text: trimText,
        processArray,
        onlyEmojy,
        date: timeMin,
        dateFull: timeFull,
        showTimeStamp: false,
        showPic: false,
        sender,
        metaUrl: null
      };
      this.props.sendMessageNow(msgObj, messageLog);
    }
  };

  render() {
    return (
      <div className="messageSendMessage">
        <MessageSendFile />
        <div className="messageSendMessage_textArea">
          <Textarea
            readOnly={this.state.readOnly}
            ref={input => {
              this.textInput = input;
            }}
            onKeyPress={this.handleTypeEvent}
            onKeyUp={e => {
              const value = e.target.selectionStart;
              const { cursorPosition } = this.state;
              if (value !== cursorPosition) {
                this.setState({
                  cursorPosition: value
                });
              }
            }}
            onClick={e => {
              const value = e.target.selectionStart;
              const { cursorPosition } = this.state;
              if (value !== cursorPosition) {
                this.setState({
                  cursorPosition: value
                });
              }
            }}
            onChange={e => {
              this.setState({ inputValue: e.target.value });
            }}
            value={this.state.inputValue}
            className="messageSendMessage_textArea_text"
            placeholder="Type a message"
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  messageLog: state.getMessages,
  emoji: state.getSentEmoji
});

export default connect(mapStateToProps, {
  sendMessageNow
})(MessageSendMessage);
