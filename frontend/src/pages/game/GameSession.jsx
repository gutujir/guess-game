import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import io from "socket.io-client";
import MessageList from "./MessageList";
import PlayerList from "./PlayerList";
import GuessForm from "./GuessForm";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";
const COUNTDOWN_SECONDS = 60;

const ResultBanner = ({ winner, answer, currentUserId }) => {
  const winnerId = winner?._id || winner;
  const hasWinner = Boolean(winnerId);
  const isCurrentUserWinner = hasWinner && winnerId === currentUserId;
  const winnerName =
    winner?.username || winner?.fullName || (hasWinner ? "Winner" : "");

  return (
    <div
      className={`winner-banner border-2 rounded-lg p-4 my-4 text-center ${
        hasWinner
          ? "bg-green-100 border-green-400"
          : "bg-amber-50 border-amber-300"
      }`}
    >
      {hasWinner ? (
        <>
          🎉 <span className="font-bold">{winnerName}</span>{" "}
          {isCurrentUserWinner ? "(You have won!)" : "won this round!"}
        </>
      ) : (
        <>
          ⏰ <span className="font-bold">Time's up!</span> No winner this round.
        </>
      )}
      <div className="text-gray-700 mt-2">
        Answer: <span className="font-mono">{answer || "Unavailable"}</span>
      </div>
    </div>
  );
};

const GameSession = () => {
  const navigate = useNavigate();
  const { code } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [session, setSession] = useState(null);
  const [guess, setGuess] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [qaError, setQaError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [guessLoading] = useState(false);
  const [msgLoading] = useState(false);
  const socket = useRef(null);
  const messagesEndRef = useRef(null);

  const params = new URLSearchParams(window.location.search);
  const isDetailsView = params.get("view") === "details";

  const isGameMaster = useMemo(() => {
    if (!session || !user) return false;
    const gmId = session.gameMaster?._id || session.gameMaster;
    return gmId === user._id;
  }, [session, user]);

  const winnerId = session?.winner?._id || session?.winner;
  const sortedPlayers = useMemo(() => {
    if (!session?.players) return [];
    const gmId = session.gameMaster?._id || session.gameMaster;
    const players = [...session.players];
    return players.sort((a, b) => {
      const aId = a._id || a;
      const bId = b._id || b;
      if (aId === winnerId) return -1;
      if (bId === winnerId) return 1;
      if (aId === gmId) return -1;
      if (bId === gmId) return 1;
      return 0;
    });
  }, [session, winnerId]);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (session?.status === "in-progress" && session?.startTime) {
      const interval = setInterval(() => setNow(Date.now()), 250);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [session?.status, session?.startTime]);

  let timer = COUNTDOWN_SECONDS;
  if (session?.status === "in-progress" && session?.startTime) {
    const started = new Date(session.startTime).getTime();
    const elapsed = Math.floor((now - started) / 1000);
    timer = Math.max(0, COUNTDOWN_SECONDS - elapsed);
  }

  useEffect(() => {
    socket.current = io(API_BASE.replace("/api", ""), {
      transports: ["websocket"],
    });
    socket.current.emit("joinSession", code);
    socket.current.on("sessionUpdated", (updatedSession) => {
      setSession(updatedSession);
    });
    socket.current.on("sessionDeleted", () => {
      navigate("/lobby");
    });
    socket.current.on("sessionTimeout", (payload) => {
      setActionError(payload?.message || "Session timed out");
    });
    socket.current.on("newMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [code, navigate]);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await axios.get(`${API_BASE}/games/${code}`, {
          withCredentials: true,
        });
        setSession(res.data.session);
      } catch {
        setError("Session not found or unauthorized");
      }
    };
    fetchSession();
  }, [code]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (!session?._id) return;
        const res = await axios.get(`${API_BASE}/messages/${session._id}`);
        setMessages(res.data);
      } catch {
        // Ignore message fetch errors for now
      }
    };
    fetchMessages();
  }, [session]);

  // Clear question/answer when session resets for new round (after game ends)
  useEffect(() => {
    if (
      (session?.status === "waiting" || session?.status === "ended") &&
      !session?.question &&
      !session?.answer &&
      isGameMaster
    ) {
      // Use setTimeout to avoid synchronous setState in effect
      const timer = setTimeout(() => {
        setQuestion("");
        setAnswer("");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [session?.status, session?.question, session?.answer, isGameMaster]);

  // Load existing question/answer if available (shouldn't happen in normal flow)
  useEffect(() => {
    if (
      isGameMaster &&
      (session?.status === "waiting" || session?.status === "ended") &&
      session?.question &&
      question !== session.question
    ) {
      const timer = setTimeout(() => {
        setQuestion(session.question);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isGameMaster, session?.status, session?.question, question]);

  useEffect(() => {
    if (
      isGameMaster &&
      (session?.status === "waiting" || session?.status === "ended") &&
      session?.answer &&
      answer !== session.answer
    ) {
      const timer = setTimeout(() => {
        setAnswer(session.answer);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isGameMaster, session?.status, session?.answer, answer]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleStartGame = async () => {
    setActionError("");
    setQaError("");
    if (!session) return;
    if (!question.trim() || !answer.trim()) {
      setQaError("Please set both a question and answer before starting.");
      return;
    }
    setActionLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE}/games/start`,
        { code: session.code, question, answer },
        { withCredentials: true }
      );
      setSession(res.data.session);
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to start game");
    }
    setActionLoading(false);
  };

  const handleLeaveSession = async () => {
    if (!session) return;
    setActionLoading(true);
    setActionError("");
    try {
      await axios.post(
        `${API_BASE}/games/leave`,
        { code: session.code, userId: user?._id },
        { withCredentials: true }
      );
      navigate("/lobby");
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to leave session");
    }
    setActionLoading(false);
  };

  const handleGuess = async (e) => {
    e.preventDefault();
    if (!guess.trim()) return;
    setError("");
    try {
      await axios.post(
        `${API_BASE}/games/guess`,
        { code, guess },
        { withCredentials: true }
      );
      setGuess("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit guess");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !session?._id) return;
    try {
      await axios.post(
        `${API_BASE}/messages/send_message`,
        {
          sessionId: session._id,
          content: message,
          type: "chat",
        },
        { withCredentials: true }
      );
      setMessage("");
    } catch {
      // Optional: display chat error
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading session...</div>
      </div>
    );
  }

  if (isDetailsView && session.status === "ended") {
    let statusColor = "bg-red-500 text-white";
    let statusText = "Ended";
    if (session.status === "waiting") {
      statusColor = "bg-yellow-400 text-gray-900";
      statusText = "Waiting";
    } else if (session.status === "in-progress") {
      statusColor = "bg-green-500 text-white";
      statusText = "In Progress";
    }
    return (
      <div className="max-w-xl mx-auto mt-10 bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-4 text-center text-green-700">
          Game Details
        </h2>
        <div className="mb-2 text-lg">
          <span className="font-semibold">Session Code:</span> {session.code}
        </div>
        <div className="mb-2 text-lg flex items-center gap-2">
          <span className="font-semibold">Status:</span>
          <span
            className={`inline-block px-3 py-1 rounded-full font-semibold text-sm ${statusColor}`}
          >
            {statusText}
          </span>
        </div>
        <div className="mb-2 text-lg">
          <span className="font-semibold">Question:</span>{" "}
          {session.question || (
            <span className="italic text-gray-400">No question set</span>
          )}
        </div>
        <div className="mb-2 text-lg">
          <span className="font-semibold">Players:</span>{" "}
          {session.players?.length || 0}
        </div>
        <div className="mb-2 text-lg">
          <span className="font-semibold">Winner:</span>{" "}
          {session.winner ? (
            session.winner.username || session.winner.fullName || "Winner"
          ) : (
            <span className="italic text-gray-400">No winner</span>
          )}
        </div>
        <div className="mb-2 text-lg">
          <span className="font-semibold">Answer:</span>{" "}
          {session.answer || (
            <span className="italic text-gray-400">No answer set</span>
          )}
        </div>
        <div className="mt-6 flex justify-center">
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold"
            onClick={() => window.history.back()}
          >
            Back to Lobby
          </button>
        </div>
      </div>
    );
  }

  const userAttempt = session?.attempts?.find(
    (a) => (a.userId?._id || a.userId) === user?._id
  );
  const attemptsLeft = userAttempt?.attemptsLeft ?? 0;
  const hasWinner = Boolean(session?.winner);

  const disableGuess =
    session.status !== "in-progress" ||
    timer === 0 ||
    isGameMaster ||
    hasWinner ||
    attemptsLeft < 1;

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 py-8">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-2 text-green-700">
          Game Session: {session.code}
        </h2>
        {(() => {
          let statusColor = "bg-gray-400 text-white";
          let statusText = session.status;
          if (session.status === "in-progress") {
            statusColor = "bg-green-500 text-white";
            statusText = "In Progress";
          } else if (session.status === "waiting") {
            statusColor = "bg-yellow-400 text-gray-900";
            statusText = "Waiting";
          } else if (session.status === "ended") {
            statusColor = "bg-red-500 text-white";
            statusText = "Ended";
          }
          return (
            <div className="mb-2 text-gray-600 flex items-center gap-2">
              Status:
              <span
                className={`inline-block px-3 py-1 rounded-full font-semibold text-sm ${statusColor}`}
              >
                {statusText}
              </span>
            </div>
          );
        })()}
        <div className="mb-2">Players: {session.players?.length || 0}</div>
        <PlayerList
          players={sortedPlayers}
          gameMasterId={session.gameMaster?._id || session.gameMaster}
          winnerId={winnerId}
          attempts={session.attempts}
          sessionStatus={session.status}
        />
        <div className="mb-2">
          Scores:
          <ul className="ml-4 list-disc">
            {session.scores?.map((score) => (
              <li key={score.userId?._id || score.userId}>
                {score.userId?.username || score.userId?.fullName || "Player"}:{" "}
                {score.score}
              </li>
            ))}
          </ul>
        </div>

        {isGameMaster &&
          (session.status === "waiting" || session.status === "ended") && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex flex-col items-center">
              <div className="text-blue-700 font-semibold mb-2">
                {session.status === "ended"
                  ? "You are now the Game Master. Set a new question and answer to start the next round."
                  : "You are the Game Master. Set the question and answer, then start the game when all players have joined."}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleStartGame();
                }}
                className="w-full flex flex-col gap-3"
              >
                <input
                  type="text"
                  className="border rounded px-3 py-2 w-full"
                  placeholder="Enter the question for this game"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  required
                />
                <input
                  type="text"
                  className="border rounded px-3 py-2 w-full"
                  placeholder="Enter the answer (case-insensitive)"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-lg hover:bg-blue-700 transition"
                  disabled={actionLoading}
                >
                  {actionLoading ? "Starting..." : "Start Game"}
                </button>
                {qaError && (
                  <div className="text-red-500 text-sm mt-1">{qaError}</div>
                )}
              </form>
            </div>
          )}

        {session.status === "in-progress" && session.question && (
          <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 mb-4 text-center">
            <span className="font-semibold text-blue-800">Question:</span>
            <span className="ml-2 text-lg text-blue-900 font-mono">
              {session.question}
            </span>
          </div>
        )}

        {session.status === "in-progress" && (
          <div className="mb-2 text-center">
            <span className="inline-block bg-gray-200 text-gray-800 px-4 py-1 rounded-full font-mono text-lg">
              Time left: {timer}s
            </span>
          </div>
        )}

        {session.status === "ended" && (
          <ResultBanner
            winner={session.winner}
            answer={session.answer}
            currentUserId={user?._id}
          />
        )}

        <button
          onClick={handleLeaveSession}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mb-4 ml-2 font-bold shadow transition"
          disabled={actionLoading}
        >
          {actionLoading ? "Leaving..." : "Leave Session"}
        </button>

        <GuessForm
          guess={guess}
          setGuess={setGuess}
          onSubmit={handleGuess}
          loading={guessLoading}
          disabled={disableGuess}
        />
        {disableGuess && session.status === "in-progress" && !hasWinner && (
          <div className="text-red-500 mt-2">
            {isGameMaster
              ? "Game masters cannot submit guesses."
              : attemptsLeft < 1
              ? `No attempts left. You used all 3 attempts.`
              : timer === 0
              ? "Time's up!"
              : "Cannot submit guess."}
          </div>
        )}
        {session.status === "in-progress" &&
          !isGameMaster &&
          !hasWinner &&
          attemptsLeft > 0 &&
          timer > 0 && (
            <div className="text-blue-600 mt-2">
              Attempts remaining: {attemptsLeft} / 3
            </div>
          )}
        {error && <div className="text-red-500 mt-2">{error}</div>}
        {actionError && <div className="text-red-500 mt-2">{actionError}</div>}
      </div>

      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6 flex flex-col h-96">
        <h3 className="text-lg font-semibold mb-2 text-amber-700">
          Session Chat
        </h3>
        <div className="flex-1 overflow-y-auto border rounded p-2 bg-gray-50 mb-2">
          <MessageList messages={messages} userId={user?._id} />
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border rounded px-3 py-2"
            required
          />
          <button
            type="submit"
            className="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600"
            disabled={msgLoading}
          >
            {msgLoading ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GameSession;
