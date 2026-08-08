import { createContext, useContext, useEffect, useState, useCallback } from "react";
import socket from "../utils/socket";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [toasts, setToasts] = useState([]);

  const pushToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, ...toast }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismissToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // Connect once, for the whole app, whenever a user is logged in
  useEffect(() => {
    if (!user) return;

    if (!socket.connected) socket.connect();
    socket.emit("user:register", { userId: user.id });

    const handlePaymentReceived = (data) => {
      pushToast({
        type: "payment",
        title: `${data.fromName} paid you`,
        message: `₹${data.amount.toFixed(2)} in "${data.groupName}"`,
        color: data.fromColor,
      });
    };

    socket.on("notification:paymentReceived", handlePaymentReceived);

    return () => {
      socket.off("notification:paymentReceived", handlePaymentReceived);
    };
  }, [user, pushToast]);

  // Disconnect fully on logout
  useEffect(() => {
    if (!user && socket.connected) socket.disconnect();
  }, [user]);

  return (
    <NotificationContext.Provider value={{ toasts, pushToast, dismissToast }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
