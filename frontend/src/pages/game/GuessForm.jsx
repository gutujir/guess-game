import React from "react";

const GuessForm = ({ guess, setGuess, onSubmit, loading, disabled }) => {
  return (
    <form onSubmit={onSubmit} className="flex gap-2 mt-4">
      <input
        type="text"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        placeholder="Enter your guess"
        className="flex-1 border rounded px-3 py-2 text-lg"
        required
        disabled={disabled}
      />
      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-lg hover:bg-green-700 transition"
        disabled={loading || disabled}
      >
        {loading ? "Submitting..." : "Submit Guess"}
      </button>
    </form>
  );
};

export default GuessForm;
