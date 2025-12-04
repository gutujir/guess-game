import React from "react";

const MessageList = ({ messages, userId }) => {
  return (
    <ul className="space-y-3">
      {messages.map((msg, idx) => {
        const isMe = msg.userId?._id === userId;
        const isSystem = msg.type === "system" || !msg.userId;

        if (isSystem) {
          return (
            <li key={msg._id || idx} className="flex justify-center my-2">
              <span className="text-xs text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700">
                {msg.content}
              </span>
            </li>
          );
        }

        return (
          <li
            key={msg._id || idx}
            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] flex flex-col ${
                isMe ? "items-end" : "items-start"
              }`}
            >
              <span className="text-[10px] text-slate-400 mb-1 px-1">
                {msg.userId?.fullName || msg.userId?.username || "User"}
              </span>
              <div
                className={`px-4 py-2 rounded-2xl text-sm shadow-sm ${
                  isMe
                    ? "bg-violet-600 text-white rounded-tr-none"
                    : "bg-slate-700 text-slate-200 rounded-tl-none"
                }`}
              >
                {msg.content}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default MessageList;
