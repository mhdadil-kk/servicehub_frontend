import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  const token = localStorage.getItem("accessToken");

  if (!socket) {
    socket = io("http://localhost:5000", {
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
