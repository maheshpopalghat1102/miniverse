
import React from "react";
import { getHintLabel } from "./guessNumberLogic";

function GuessHistory({ history = [], playerNames = {} }) {
  if (history.length === 0) {
    return (
      <div className="gn-history-empty">
        <span>🔢</span>
        <p>No guesses yet.</p>
        <small>Your guesses will appear here.</small>
      </div>
    );
  }

  return (
    <div className="gn-history">
      <div className="gn-history-heading">
        <h3>Guess History</h3>
        <span>{history.length} guesses</span>
      </div>

      <div className="gn-history-list">
        {[...history].reverse().map((item, index) => (
          <div
            className={`gn-history-item gn-history-${item.hint}`}
            key={`${item.player}-${item.attempt}-${index}`}
          >
            <div className="gn-history-player">
              <span className="gn-history-symbol">
                {item.player}
              </span>

              <div>
                <strong>
                  {playerNames[item.player] ||
                    `Player ${item.player}`}
                </strong>
                <small>Attempt #{item.attempt}</small>
              </div>
            </div>

            <strong className="gn-history-guess">
              {item.guess}
            </strong>

            <span className="gn-history-hint">
              {getHintLabel(item.hint)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GuessHistory;
