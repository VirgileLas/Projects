function compareArrayOrString(a, b) {
  const toArray = (val) => (Array.isArray(val) ? val : [val]);
  const setA = new Set(toArray(a));
  const setB = new Set(toArray(b));
  const intersection = [...setA].filter((x) => setB.has(x));
  return {
    matchAll:
      setA.size === intersection.length && setB.size === intersection.length,
    partialMatch: intersection.length > 0,
  };
}

const comparators = {
  word_guess: (guess, solution) => {
    const result = Array(guess.length).fill("red");
    const solutionChars = solution.split("");
    const used = Array(guess.length).fill(false);

    for (let i = 0; i < guess.length; i++) {
      if (guess[i] === solution[i]) {
        result[i] = "green";
        used[i] = true;
        solutionChars[i] = null;
      }
    }

    for (let i = 0; i < guess.length; i++) {
      if (result[i] !== "green") {
        const idx = solutionChars.indexOf(guess[i]);
        if (idx !== -1) {
          result[i] = "orange";
          solutionChars[idx] = null;
        }
      }
    }

    return result;
  },

  character_guess: (guess, solution) => {
    const result = [];
    console.log(
      "Comparing character guess:",
      guess,
      "with solution:",
      solution
    ); //debug
    for (const key of Object.keys(solution)) {
      const guessVal = guess[key];
      const solVal = solution[key];

      if (guessVal === undefined) continue;

      if (guessVal === solVal) {
        result.push("green");
      } else if (Array.isArray(guessVal) || Array.isArray(solVal)) {
        const { matchAll, partialMatch } = compareArrayOrString(
          guessVal,
          solVal
        );
        if (matchAll) {
          result.push("green");
        } else if (partialMatch) {
          result.push("orange");
        } else {
          result.push("red");
        }
      } else {
        result.push("red");
      }
    }
    return result;
  },
};

module.exports = comparators;
