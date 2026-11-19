import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const TOKEN_KEY = "kisansathi_token";

export default function useLiveUpdates({ events, centerId, onEvent }) {
  const handlerRef = useRef(onEvent);
  const eventKey = events.join(",");

  useEffect(() => {
    handlerRef.current = onEvent;
  });

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const socket = io(import.meta.env.VITE_SOCKET_URL || undefined, {
      auth: token ? { token } : {},
    });

    socket.on("connect", () => {
      if (centerId) socket.emit("center:join", centerId);
    });

    eventKey.split(",").forEach((name) => {
      socket.on(name, (payload) => handlerRef.current?.(name, payload));
    });

    return () => {
      socket.close();
    };
  }, [eventKey, centerId]);
}