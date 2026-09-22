import { io, Socket } from "socket.io-client";
import { API_ORIGIN } from "./constants/api";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  const token = localStorage.getItem("accessToken");

  if (!socket) {
    socket = io(API_ORIGIN, {
      auth: {
        token
      },
      autoConnect: false
    });
  } else {
    socket.auth = { token };
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
