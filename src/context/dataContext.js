import React, { Component } from "react";
import PropTypes from "prop-types";
import socketClient from "../socket/socketClient";
import {
  retunUserAccount,
  loadConversationLog,
  processMessage,
  pushMessageToFirebase,
  createNewConvoRoom,
  loadUserConvos,
  searchUsers
} from "../API/firestore";
import { returnUserId } from "../API/auth";

const DatabaseContext = React.createContext();

export const DatabaseConsumer = DatabaseContext.Consumer;

/* eslint-disable react/no-did-mount-set-state */

export class DatabaseProvider extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired
  };

  state = {
    userData: null,
    userConvoRooms: {},
    userConvoLogs: {},
    userMessageConvos: null,
    userActiveConversationLog: [],
    userSearchResult: [],
    userActiveRoom: null,
    convoIsLoading: true
  };

  async componentDidMount() {
    const uid = await returnUserId();
    const userData = await retunUserAccount(uid);
    this.setState({
      userData
    });

    socketClient.emit("SUBSCRIBE_USER_CONVOS", uid);
    socketClient.emit("SUBSCRIBE_NEW_CONNECTIONS", uid);
    this.initMessagesSocket();
    await this.loadConvos();
    this.loadConversation();
    this.loadUserConnections();
  }

  componentWillUnmount() {
    socketClient.off("RECEIVE_MESSAGE");
    socketClient.off("RECEIVE_CONVO");
  }

  initMessagesSocket = () => {
    socketClient.on("NEW_CONNECTION", targetUid => {
      socketClient.emit("SUBSCRIBE_USER_CONVOS", targetUid);
    });
    socketClient.on("RECEIVE_MESSAGE", ({ messageData, roomId }) => {
      // Assign active log to users selected room
      const { userConvoLogs, userActiveRoom } = this.state;

      const activeConvoLog = [...userConvoLogs[roomId], messageData];
      userConvoLogs[roomId] = activeConvoLog;

      this.setState({
        userConvoLogs,
        userActiveConversationLog: userConvoLogs[userActiveRoom]
      });
    });
    socketClient.on("RECEIVE_CONVO", message => {
      console.log(message);
      const { userMessageConvos } = this.state;
      if (userMessageConvos !== null) {
        const { roomId } = message;
        if (userMessageConvos[roomId]) {
          Object.assign(userMessageConvos[roomId], {
            displayMessage: message.displayMessage,
            lastMessageTime: message.lastMessageTime
          });
        } else {
          userMessageConvos[roomId] = message;
        }

        this.setState({
          userMessageConvos
        });
      } else {
        const { roomId } = message;
        const newMessageConvos = {
          [roomId]: {
            displayMessage: message.displayMessage,
            lastMessageTime: message.lastMessageTime,
            roomId
          }
        };
        this.setState({
          userMessageConvos: newMessageConvos
        });
      }
    });
  };

  loadUserConnections = () => {
    const connectedUsers = Object.keys(this.state.userData.connections);
    connectedUsers.forEach(targetUid => {
      socketClient.emit("SUBSCRIBE_USER_CONVOS", targetUid);
    });
  };

  initConversation = async targetUser => {
    const { userConvoRooms, userData } = this.state;
    const targetUid = targetUser.uid;
    this.setState({
      convoIsLoading: true
    });
    // If conversation is not in cache
    if (!userConvoRooms[targetUid]) {
      const { uid, connections } = userData;
      socketClient.emit("CREATE_NEW_CONNECTION", { uid, targetUid });
      const convoId = connections[targetUid];
      if (convoId !== undefined) {
        userConvoRooms[targetUid] = convoId.conversationId;
        await this.setState({
          userActiveRoom: convoId.conversationId,
          userConvoRooms: { ...userConvoRooms }
        });
      } else {
        const newRoom = await createNewConvoRoom(uid, targetUid);
        userConvoRooms[targetUid] = newRoom;
        await this.setState({
          userActiveRoom: newRoom,
          userConvoRooms: { ...userConvoRooms }
        });
      }
    } else {
      const userActiveRoom = this.state.userConvoRooms[targetUid];
      await this.setState({
        userActiveRoom
      });
    }
    this.loadConversation();
  };

  loadConvos = async () => {
    const userConvos = await loadUserConvos(this.state.userData.uid);
    if (userConvos.length > 0) {
      const { roomId } = userConvos[0];
      const { uid } = this.state.userData;
      const userMessageConvos = Object.assign(
        {},
        ...userConvos.map(item => ({
          [item.roomId]: {
            displayMessage: item.displayMessage,
            lastMessageTime: item.lastMessageTime,
            uid: item.targetUid[uid],
            roomId: item.roomId
          }
        }))
      );

      this.setState({
        userMessageConvos,
        userActiveRoom: roomId
      });
    }
  };

  loadConversation = async (roomId = null) => {
    if (roomId) {
      await this.setState({
        userActiveRoom: roomId
      });
    }
    const { userConvoLogs, userActiveRoom } = this.state;
    this.setState({
      convoIsLoading: true
    });

    if (userActiveRoom !== null) {
      if (!userConvoLogs[userActiveRoom]) {
        const userActiveConversationLog = await loadConversationLog(
          userActiveRoom
        );
        userConvoLogs[userActiveRoom] = userActiveConversationLog;
        await this.setState({
          userActiveConversationLog,
          userConvoLogs: { ...userConvoLogs }
        });
      } else {
        const userActiveConversationLog = this.state.userConvoLogs[
          userActiveRoom
        ];
        await this.setState({
          userActiveConversationLog
        });
      }
      socketClient.emit("SUBSCRIBE", userActiveRoom);
    }
    this.setState({
      convoIsLoading: false
    });
  };

  searchUsers = async text => {
    const { uid } = this.state.userData;
    const userSearchResult = await searchUsers(text, uid);
    this.setState({
      userSearchResult
    });
  };

  sendMessage = message => {
    const { userActiveRoom, userActiveConversationLog, userData } = this.state;

    if (userActiveRoom) {
      const currentMsg = processMessage(
        userActiveConversationLog,
        message,
        userData.uid
      );

      pushMessageToFirebase(currentMsg, userActiveRoom);
      const messagePayload = {
        messageData: currentMsg,
        roomId: userActiveRoom
      };
      socketClient.emit("SEND_MESSAGE", messagePayload);
    }
  };

  render() {
    return (
      <DatabaseContext.Provider
        value={{
          userData: this.state.userData,
          convoIsLoading: this.state.convoIsLoading,
          conversationLog: this.state.userActiveConversationLog,
          messageConvos: this.state.userMessageConvos,
          initConversation: this.initConversation,
          loadConversation: this.loadConversation,
          searchUsers: this.searchUsers,
          userSearchResult: this.state.userSearchResult,
          sendMessage: this.sendMessage
        }}
      >
        {this.props.children}
      </DatabaseContext.Provider>
    );
  }
}
