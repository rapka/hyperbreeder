import { useState } from "react";
import times from "lodash/times";
import isEqual from "lodash/isEqual";
import reverse from "lodash/reverse";
import cloneDeep from "lodash/cloneDeep";
import filter from "lodash/filter";
import mean from "lodash/mean";
import orderBy from "lodash/orderBy";
import ResultWord from './ResultWord';
import ModePicker from './ModePicker';
import FIVE_LETTER_WORDS from "./words.json";
import charFrequencies from "./charFrequencies.json";

import logo from "./logo.svg";

import "./App.css";

const TOTAL_CHARS = 12972 * 5;

export const checkSolution = (a, g) => {
  const answer = a.toUpperCase();
  const guess = g.toUpperCase();

  if (answer === guess) {
    return [2, 2, 2, 2, 2];
  }

  let answerChars = answer;
  let guessChars = guess;
  let result = [0, 0, 0, 0, 0];

  times(5, (i) => {
    if (answer.charAt(i) === guess.charAt(i)) {
      answerChars = answerChars.replace(answer.charAt(i), "");
      guessChars = guessChars.replace(answer.charAt(i), "");
      result[i] = 2;
    }
  });

  times(5, (i) => {
    times(5, (j) => {
      if (
        result[j] !== 2 &&
        result[i] !== 2 &&
        answerChars.indexOf(guess.charAt(i)) !== - 1 &&
        answer.charAt(j) === guess.charAt(i)
      ) {
        result[i] = 1;
        console.log('a', answerChars, guess.charAt(i));
        answerChars = answerChars.replace(guess.charAt(i), "");
      }
    });
  });

  return result;
};

const renderCharResult = (char, colorCode) => {
  let className = "black";
  if (colorCode === 1) {
    className = "yellow";
  } else if (colorCode === 2) {
    className = "green";
  }

  return <div className={`char char-${className}`}>{char}</div>;
};

const renderResult = (word, result) => {
  return (
    <div className="result-word">
      {word.split("").map((c, i) => renderCharResult(c, result[i]))}
    </div>
  );
};

const sortSolutions = (solutions) => {
  return orderBy(
    solutions,
    (word) => mean(word.split("").map((c) => charFrequencies[c])),
    ["desc"]
  );
};

const narrowSolutions = (solutions, guess, result) => {
  return sortSolutions(
    filter(solutions, (solution) => {
      for (var i = 0; i < 5; i++) {
        // Current char in guess was a miss
        if (result[i] === 0) {
          if (guess.charAt(i) === solution.charAt(i)) {
            return false;
          }

          for (var j = 0; j < 5; j++) {
            if (guess.charAt(i) === solution.charAt(j) && result[j] === 0) {
              return false;
            }
          }
        } else if (result[i] === 2 && guess.charAt(i) !== solution.charAt(i)) {
          // Current char in guess was a green, possible answer doesn't match it
          return false;
        } else if (
          result[i] === 1 &&
          solution.indexOf(guess.charAt(i)) === -1
        ) {
          // current char in guess was yellow, possible answer doesn't include it at all
          return false;
        }
      }

      return true;
    })
  );
};

const findSolution = (answer, initialGuess) => {
  let possibleSolutions = cloneDeep(FIVE_LETTER_WORDS);

  const guesses = [initialGuess];
  const results = [checkSolution(answer, guesses[0])];
  const solutionsArray = [possibleSolutions];
  possibleSolutions = narrowSolutions(
    possibleSolutions,
    initialGuess,
    results[0]
  );

  while (!isEqual(results[0], [2, 2, 2, 2, 2]) && possibleSolutions.length) {
    const newGuess = possibleSolutions.shift();
    const newResult = checkSolution(answer, newGuess);
    possibleSolutions = narrowSolutions(possibleSolutions, newGuess, newResult);
    solutionsArray.unshift(possibleSolutions);
    guesses.unshift(newGuess);
    results.unshift(newResult);
  }

  reverse(guesses);
  reverse(results);
  reverse(solutionsArray);

  return { guesses, results, possibleSolutions: solutionsArray };
};

function App() {
  const [answer, setAnswer] = useState("foxes");
  const [firstGuess, setFirstGuess] = useState("races");
  const [errorText, setErrorText] = useState('');
  const [mode, setMode] = useState('solver');

  const setNewAnswer = () => {
    const newWord = document.getElementById("answer-input").value.toUpperCase();

    if (newWord.length !== 5) {
      setErrorText('Invalid answer length');
    } else if (!FIVE_LETTER_WORDS.includes(newWord)) {
      setErrorText(`"${newWord}" is not a valid word`);
    } else {
      setErrorText('');
      setAnswer(newWord);
    }
  };

  const setNewFirstGuess = () => {
    const newWord = document.getElementById("guess-input").value.toUpperCase();

    if (newWord.length !== 5) {
      setErrorText('Invalid guess length');
    } else if (!FIVE_LETTER_WORDS.includes(newWord)) {
      setErrorText(`"${newWord}" is not a valid word`);
    } else {
      setErrorText('');
      setFirstGuess(newWord);
    }
  };

  const { guesses, results, possibleSolutions } = findSolution(
    answer.toUpperCase(),
    firstGuess.toUpperCase()
  );

  const lineOutput = results.map((result, i) => {
    return (
      <div>
        Guess # {i + 1} {guesses[i]} Possible solutions:{" "}
        {possibleSolutions[i].length} Result: <ResultWord word={guesses[i]} result={result} />
      </div>
    );
  });

  return (
    <div className="App">
      <header className="App-header">
        <p>Wordle Solving Tools</p>
      </header>
      <ModePicker onChange={(evt) => setMode(evt.target.value)} mode={mode} />
      Answer: <input id="answer-input" placeholder={answer} />
      <button onClick={setNewAnswer}>set new answer</button>
      <br />
      <br />
      Initial Guess: <input id="guess-input" placeholder={firstGuess} />
      <button onClick={setNewFirstGuess}>set initial guess</button>
      {!!errorText && <div className="error-text">{errorText}</div>}
      {!errorText && lineOutput}
    </div>
  );
}

export default App;
