import React from "react";

const MessageInput = ({ message, setMessage, onSend, loading }) => {
  return (
    <form onSubmit={onSend} className="flex gap-2 mt-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 border rounded px-3 py-2 text-lg"
        required
      />
      <button
        type="submit"
        className="bg-amber-500 text-white px-4 py-2 rounded-lg font-bold text-lg hover:bg-amber-600 transition"
        disabled={loading}
      >
        {loading ? "Sending..." : "Send"}
      </button>
    </form>
  );
};

export default MessageInput;
