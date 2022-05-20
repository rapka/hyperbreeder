import { useState } from "react";
import PropTypes from 'prop-types';

const ModePicker = (props) => {
  return (
    <div onChange={props.onChange}>
      <input type="radio" value="solver" name="mode" defaultChecked /> Puzzle Solver
      <input type="radio" value="debugger" name="mode" /> AI Debugger
      <input type="radio" value="batch" name="mode" /> Batch testing
    </div>
  );
};

ModePicker.propTypes = {
  mode: PropTypes.string,
  onChange: PropTypes.func,
};

ModePicker.defaultProps = {
  mode: 'solver',
 onChange: () => {},
}

export default ModePicker;