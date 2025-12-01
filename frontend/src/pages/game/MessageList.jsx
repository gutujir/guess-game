import React from "react";

const MessageList = ({ messages, userId }) => {
  return (
    <ul className="space-y-2">
      {messages.map((msg, idx) => (
        <li
          key={msg._id || idx}
          className={`flex ${
            msg.userId?._id === userId ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`px-3 py-2 rounded-lg max-w-xs wrap-break-word shadow text-sm ${
              msg.userId?._id === userId
                ? "bg-green-100 text-green-900"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            <span className="font-semibold">
              {msg.userId?.fullName || msg.userId?.username || "User"}
            </span>
            {": "}
            {msg.content}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default MessageList;
