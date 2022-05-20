import { useState } from "react";
import PropTypes from 'prop-types';

const getClass = (colorCode) => {
  let className = "black";
  if (colorCode === 1) {
    className = "yellow";
  } else if (colorCode === 2) {
    className = "green";
  }

  return className;
};

const ResultWord = (props) => {
  const { word, result, editable } = props;
  const [wordStatus, setWordStatus] = useState(result);

  const onClick = editable ? props.onSubmit : () => {};

  const updateChar = (index) => {
    wordStatus[index] = (wordStatus[index] + 1) % 3;
    setWordStatus(wordStatus);
  }

  return (
    <div>
    <div className="result-word">
      {word.split("").map((c, i) => <div className={`char char-${getClass(wordStatus[i])}`} onClick={updateChar.bind(i)}>{c}</div>)}
    </div>
    {editable && <button onClick={onClick}>SUBMIT</button>}
    </div>
  );
};

ResultWord.propTypes = {
  artist: PropTypes.string,
  title: PropTypes.string,
  editable: PropTypes.bool,
  onSubmit: PropTypes.func,
};

ResultWord.defaultProps = {
  artist: '',
  title: '',
  editable: false,
  result: [0, 0, 0, 0, 0],
}

export default ResultWord;