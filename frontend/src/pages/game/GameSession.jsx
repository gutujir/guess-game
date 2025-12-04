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
      className={`glass-card p-6 my-4 text-center relative overflow-hidden ${
        hasWinner
          ? "border-emerald-500/50 bg-emerald-500/10"
          : "border-amber-500/50 bg-amber-500/10"
      }`}
    >
      <div className="relative z-10">
        {hasWinner ? (
          <div className="flex flex-col items-center">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="text-2xl font-bold text-white mb-1">
              {isCurrentUserWinner ? "You Won!" : `${winnerName} Won!`}
            </h3>
            <p className="text-emerald-200 text-sm">
              {isCurrentUserWinner ? "Great job!" : "Better luck next time!"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="text-4xl mb-2">⏰</div>
            <h3 className="text-2xl font-bold text-white mb-1">Time's Up!</h3>
            <p className="text-amber-200 text-sm">No winner this round.</p>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">
            The answer was
          </p>
          <p className="text-xl font-mono font-bold text-white tracking-widest">
            {answer || "Unavailable"}
          </p>
        </div>
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
  const previousStatusRef = useRef(null);

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

  // Clear question/answer fields when game transitions to "ended" status
  useEffect(() => {
    if (
      session?.status === "ended" &&
      previousStatusRef.current === "in-progress"
    ) {
      setTimeout(() => {
        setQuestion("");
        setAnswer("");
      }, 0);
    }
    previousStatusRef.current = session?.status;
  }, [session?.status]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleStartGame = async () => {
    setActionError("");
    setQaError("");
    if (!session) return;

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
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (isDetailsView && session.status === "ended") {
    let statusColor = "bg-red-500/20 text-red-300 border-red-500/30";
    let statusText = "Ended";
    if (session.status === "waiting") {
      statusColor = "bg-amber-500/20 text-amber-300 border-amber-500/30";
      statusText = "Waiting";
    } else if (session.status === "in-progress") {
      statusColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      statusText = "In Progress";
    }
    return (
      <div className="max-w-xl mx-auto mt-10 px-4">
        <div className="glass-card p-8">
          <h2 className="text-2xl font-bold mb-6 text-center text-white">
            Game Details
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-700/50 pb-3">
              <span className="text-slate-400">Session Code</span>
              <span className="font-mono text-violet-300 font-bold">
                {session.code}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-700/50 pb-3">
              <span className="text-slate-400">Status</span>
              <span
                className={`px-2 py-1 rounded text-xs border ${statusColor}`}
              >
                {statusText}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-700/50 pb-3">
              <span className="text-slate-400">Question</span>
              <span className="text-white text-right max-w-[60%]">
                {session.question || (
                  <span className="italic text-slate-500">No question set</span>
                )}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-700/50 pb-3">
              <span className="text-slate-400">Players</span>
              <span className="text-white">{session.players?.length || 0}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-700/50 pb-3">
              <span className="text-slate-400">Winner</span>
              <span className="text-emerald-400 font-bold">
                {session.winner ? (
                  session.winner.username || session.winner.fullName || "Winner"
                ) : (
                  <span className="italic text-slate-500 font-normal">
                    No winner
                  </span>
                )}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-700/50 pb-3">
              <span className="text-slate-400">Answer</span>
              <span className="text-white font-mono">
                {session.answer || (
                  <span className="italic text-slate-500">No answer set</span>
                )}
              </span>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              className="btn-secondary"
              onClick={() => window.history.back()}
            >
              Back to Lobby
            </button>
          </div>
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
    <div className="max-w-7xl mx-auto px-4 py-6 h-[calc(100vh-80px)] flex flex-col md:flex-row gap-6">
      {/* Left Panel: Game State & Controls */}
      <div className="w-full md:w-1/3 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">
              Session{" "}
              <span className="text-violet-400 font-mono">{session.code}</span>
            </h2>
            {(() => {
              let statusColor = "bg-slate-700 text-slate-300";
              let statusText = session.status;
              let statusDot = "bg-slate-400";

              if (session.status === "in-progress") {
                statusColor =
                  "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
                statusText = "In Progress";
                statusDot = "bg-emerald-400 animate-pulse";
              } else if (session.status === "waiting") {
                statusColor =
                  "bg-amber-500/20 text-amber-300 border border-amber-500/30";
                statusText = "Waiting";
                statusDot = "bg-amber-400 animate-pulse";
              } else if (session.status === "ended") {
                statusColor =
                  "bg-red-500/20 text-red-300 border border-red-500/30";
                statusText = "Ended";
                statusDot = "bg-red-400";
              }

              return (
                <div
                  className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 ${statusColor}`}
                >
                  <span className={`w-2 h-2 rounded-full ${statusDot}`}></span>
                  {statusText}
                </div>
              );
            })()}
          </div>

          {session.status === "in-progress" && (
            <div className="mb-6 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-4 border-violet-500/30 bg-slate-900/50 relative">
                <span
                  className={`text-2xl font-mono font-bold ${
                    timer < 10 ? "text-red-400" : "text-white"
                  }`}
                >
                  {timer}s
                </span>
                <svg
                  className="absolute top-0 left-0 w-full h-full -rotate-90"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-violet-500"
                    strokeDasharray="289.02652413026095"
                    strokeDashoffset={
                      289.02652413026095 * (1 - timer / COUNTDOWN_SECONDS)
                    }
                    style={{ transition: "stroke-dashoffset 1s linear" }}
                  />
                </svg>
              </div>
            </div>
          )}

          {session.status === "in-progress" && session.question && (
            <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-4 mb-6 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500"></div>
              <span className="text-xs uppercase tracking-wider text-violet-300 block mb-2">
                Current Question
              </span>
              <span className="text-lg text-white font-medium block">
                {session.question}
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

          {isGameMaster &&
            (session.status === "waiting" || session.status === "ended") && (
              <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <div className="text-blue-200 font-semibold mb-3 text-sm flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Game Master Controls
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleStartGame();
                  }}
                  className="flex flex-col gap-3"
                >
                  <input
                    type="text"
                    className="input-field text-sm"
                    placeholder="Enter Question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    className="input-field text-sm"
                    placeholder="Enter Answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="btn-primary w-full py-2 text-sm"
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Starting..." : "Start Round"}
                  </button>
                  {qaError && (
                    <div className="text-red-400 text-xs mt-1">{qaError}</div>
                  )}
                </form>
              </div>
            )}

          <div className="space-y-4">
            <GuessForm
              guess={guess}
              setGuess={setGuess}
              onSubmit={handleGuess}
              loading={guessLoading}
              disabled={disableGuess}
            />

            {disableGuess && session.status === "in-progress" && !hasWinner && (
              <div className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded border border-red-500/20">
                {isGameMaster
                  ? "Game masters cannot submit guesses."
                  : attemptsLeft < 1
                  ? `No attempts left.`
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
                <div className="text-blue-300 text-sm text-center">
                  Attempts remaining:{" "}
                  <span className="font-bold text-white">{attemptsLeft}</span> /
                  3
                </div>
              )}

            {error && (
              <div className="text-red-400 text-sm text-center">{error}</div>
            )}
            {actionError && (
              <div className="text-red-400 text-sm text-center">
                {actionError}
              </div>
            )}
          </div>

          <button
            onClick={handleLeaveSession}
            className="w-full mt-6 text-red-400 hover:text-red-300 text-sm font-medium transition-colors flex items-center justify-center gap-2"
            disabled={actionLoading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                clipRule="evenodd"
              />
            </svg>
            {actionLoading ? "Leaving..." : "Leave Session"}
          </button>
        </div>

        {/* Player List */}
        <div className="glass-card p-6 flex-1">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
            <span>Players</span>
            <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-full">
              {session.players?.length || 0}
            </span>
          </h3>
          <PlayerList
            players={sortedPlayers}
            gameMasterId={session.gameMaster?._id || session.gameMaster}
            winnerId={winnerId}
            attempts={session.attempts}
            sessionStatus={session.status}
            scores={session.scores}
          />
        </div>
      </div>

      {/* Right Panel: Chat */}
      <div className="w-full md:w-2/3 flex flex-col glass-card overflow-hidden h-[500px] md:h-auto">
        <div className="p-4 border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-md">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-violet-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                clipRule="evenodd"
              />
            </svg>
            Live Chat
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-900/30">
          <MessageList messages={messages} userId={user?._id} />
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-slate-700/50 bg-slate-800/30 backdrop-blur-md">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="input-field flex-1"
              required
            />
            <button
              type="submit"
              className="btn-primary px-6"
              disabled={msgLoading}
            >
              {msgLoading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GameSession;
