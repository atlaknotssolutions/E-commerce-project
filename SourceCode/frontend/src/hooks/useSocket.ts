import { useEffect, useRef } from 'react';
import { useAppSelector } from '../Redux Toolkit/Store';
import { connectSocket, disconnectSocket, getSocket } from '../services/socketClient';
import { Socket } from 'socket.io-client';

export function useSocket(): Socket | null {
  const token = useAppSelector((state) => state.auth?.jwt || state.sellerAuth?.jwt);
  const prevToken = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (token && token !== prevToken.current) {
      prevToken.current = token;
      connectSocket(token);
    }

    if (!token && prevToken.current) {
      prevToken.current = undefined;
      disconnectSocket();
    }
  }, [token]);

  return getSocket();
}
