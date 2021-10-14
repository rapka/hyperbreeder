import sample from 'lodash/sample';
import filter from 'lodash/filter';
import loreTickerLines from './loreTickerLines';


const nextLoreTickerLine = (save) => {
	const validLines = filter(loreTickerLines, line => line.isValid(save));
	return sample(validLines).text;
};

export default nextLoreTickerLine;