import cloneDeep from 'lodash/cloneDeep';

const SUFFIX_LIST = ['K', 'M', 'B', 'T', 'Q'];

const formatNumber = (number) => {
    let suffixes = cloneDeep(SUFFIX_LIST);
    let suffix = '';
    let value = number;

    if (number <= 10000) {
        return {
            value,
            suffix,
        };
    }

    while (value >= 1000) {
        value = value / 1000;
        suffix = suffixes.shift();
    }

    return {
        value,
        suffix,
    };
};

export default formatNumber;