const rbinom = (n, p = 0.5) => {
    var total = 0;

    for (var i=0; i<n; i++) {
        var result = 0;
        if (Math.random() < p) {
            result++;
        }

        total = total + result;
    }

    return total;
};

export default rbinom