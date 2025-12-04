import React from "react";

const GuessForm = ({ guess, setGuess, onSubmit, loading, disabled }) => {
  return (
    <form onSubmit={onSubmit} className="flex gap-2 mt-4">
      <input
        type="text"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        placeholder="Enter your guess..."
        className="input-field flex-1"
        disabled={disabled || loading}
        maxLength={200}
        required
      />
      <button
        type="submit"
        className={`px-6 py-2 rounded-lg font-bold transition-all shadow-lg ${
          disabled || !guess.trim()
            ? "bg-slate-700 text-slate-500 cursor-not-allowed"
            : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 hover:shadow-emerald-500/20"
        }`}
        disabled={disabled || loading || !guess.trim()}
      >
        {loading ? "..." : "Guess"}
      </button>
    </form>
  );
};

export default GuessForm;
