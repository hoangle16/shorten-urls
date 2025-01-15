import { useEffect, useRef, useState } from "react";
import socket from "../utils/socket";

const useSocket = (userId) => {
  const [notification, setNotification] = useState(null);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const hasEmittedLogin = useRef(false);

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);

      if (userId && !hasEmittedLogin.current) {
        socket.emit("login", userId);
        hasEmittedLogin.current = true;
      }
    };
    const handleDisconnect = () => {
      setIsConnected(false);
      hasEmittedLogin.current = false;
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    if (userId && !hasEmittedLogin.current) {
      socket.emit("login", userId);
      hasEmittedLogin.current = true;
    }

    const handleNotification = (data) => {
      setNotification(data);
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("notification", handleNotification);

      hasEmittedLogin.current = false;
    };
  }, [userId]);

  const sendNotification = (eventName, data) => {
    if (isConnected) {
      socket.emit(eventName, data);
    } else {
      console.warn("Socket is not connected");
    }
  };

  return { notification, sendNotification, isConnected };
};

export default useSocket;
