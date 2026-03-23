import React from 'react';

function ResultModal({ isOpen, movie, guess, isCorrect, onClose }) {
  if (!isOpen || !movie) {
    return null;
  }

  const message = isCorrect
    ? `Correct! "${movie.title}" is the movie of the day.`
    : `Not quite. You guessed "${guess}", but the answer was "${movie.title}".`;

  return (
    <div className="result-modal" role="dialog" aria-modal="true">
      <div className="result-modal__content">
        <h3>{isCorrect ? 'Nice job!' : 'Try again'}</h3>
        <p>{message}</p>
        <button className="result-modal__close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default ResultModal;
