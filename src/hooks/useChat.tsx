import { useState } from "react";

const useChat = () => {
  const [messages, setMessages] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState('');
  return { messages, loading, value, setMessages, setLoading, setValue };
};

export default useChat;