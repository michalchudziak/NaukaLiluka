const findDivisors = (number: number): number[] => {
  const divisors = [];
  for (let i = 1; i <= number; i++) {
    if (number % i === 0) {
      divisors.push(i);
    }
  }
  return divisors;
};

export const buildIntegerEquations = (day: number, numberLimit: number, count: number) => {
  const equations = [];
  const operators = [];
  switch (day) {
    case 1:
      operators.push('+');
      break;
    case 2:
      operators.push('-');
      break;
    case 3:
      operators.push('*');
      break;
    case 4:
      operators.push('/');
      break;
    case 5:
      operators.push('+');
      operators.push('-');
      operators.push('*');
      operators.push('/');
      break;
  }
  for (let i = 0; i < count; i++) {
    const a = Math.floor(Math.random() * numberLimit);
    let b = Math.floor(Math.random() * Math.floor(numberLimit / 7));
    const operator = operators[Math.floor(Math.random() * operators.length)];

    if (operator === '/') {
      const divisors = findDivisors(a);

      if (divisors.length > 0) {
        b = divisors[Math.floor(Math.random() * divisors.length)];
      } else {
        b = 1;
      }

      if (b === 0) {
        b = 1;
      }
    }

    const leftSide = `${Math.max(a, b)} ${operator} ${Math.min(a, b)}`;
    const rightSide = `= ${eval(leftSide)}`;
    equations.push([leftSide, rightSide]);
  }
  return equations;
};

export const buildNegativeIntegerEquations = (day: number, numberLimit: number, count: number) => {
  const equations = [];
  const operators = [];
  switch (day) {
    case 1:
      operators.push('+');
      break;
    case 2:
      operators.push('-');
      break;
    case 3:
      operators.push('*');
      break;
    case 4:
      operators.push('/');
      break;
    case 5:
      operators.push('+');
      operators.push('-');
      operators.push('*');
      operators.push('/');
      break;
  }

  for (let i = 0; i < count; i++) {
    let a = Math.floor(Math.random() * numberLimit);
    let b = Math.floor(Math.random() * Math.floor(numberLimit / 7));
    const operator = operators[Math.floor(Math.random() * operators.length)];

    // Randomly decide which numbers should be negative
    const negativeChoice = Math.floor(Math.random() * 3);
    switch (negativeChoice) {
      case 0: // Only a is negative
        a = -a;
        break;
      case 1: // Only b is negative
        b = -b;
        break;
      case 2: // Both are negative
        a = -a;
        b = -b;
        break;
    }

    // Special handling for division
    if (operator === '/') {
      // Use absolute value to find divisors, then apply sign
      const absA = Math.abs(a);
      const divisors = findDivisors(absA);

      if (divisors.length > 0) {
        const divisor = divisors[Math.floor(Math.random() * divisors.length)];
        // Randomly decide if divisor should be negative
        b = Math.random() < 0.5 ? divisor : -divisor;
        // Ensure a is divisible by b
        a = absA * (a < 0 ? -1 : 1);
      } else {
        b = b === 0 ? 1 : b;
      }
    }

    // Format equation with parentheses for negative numbers
    const leftSide = `${a} ${operator} ${b}`;
    const rightSide = `= ${eval(leftSide)}`;
    equations.push([leftSide, rightSide]);
  }

  return equations;
};

export const buildDecimalEquations = (day: number, numberLimit: number, count: number) => {
  const equations = [];
  const operators = [];
  switch (day) {
    case 1:
      operators.push('+');
      break;
    case 2:
      operators.push('-');
      break;
    case 3:
      operators.push('*');
      break;
    case 4:
      operators.push('/');
      break;
    case 5:
      operators.push('+');
      operators.push('-');
      operators.push('*');
      operators.push('/');
      break;
  }

  for (let i = 0; i < count; i++) {
    const operator = operators[Math.floor(Math.random() * operators.length)];
    let a: number;
    let b: number;

    if (operator === '/') {
      // For division, work with integers multiplied by 100 to ensure clean decimal results
      const aInt = Math.floor(Math.random() * numberLimit * 100);
      const divisors = findDivisors(aInt);

      let bInt: number;
      if (divisors.length > 1) {
        // Skip 1 and the number itself for more interesting divisions
        const filteredDivisors = divisors.filter((d) => d !== 1 && d !== aInt);
        bInt =
          filteredDivisors.length > 0
            ? filteredDivisors[Math.floor(Math.random() * filteredDivisors.length)]
            : divisors[Math.floor(Math.random() * divisors.length)];
      } else {
        bInt = 100; // Default to 1 when divided by 100
      }

      // Convert back to decimals
      a = aInt / 100;
      b = bInt / 100;

      // Ensure b is greater than 0.5
      if (b <= 0.5) {
        b = 1;
      }
    } else {
      // For other operations, generate random decimals up to 3 decimal places
      a = Math.floor(Math.random() * numberLimit * 100) / 100;
      b = Math.floor(Math.random() * Math.floor(numberLimit / 7) * 100) / 100;
    }

    // Format numbers to remove trailing zeros
    const formatNumber = (n: number) => {
      const rounded = Math.round(n * 100) / 100;
      return rounded.toString();
    };

    const leftSide = `${formatNumber(a)} ${operator} ${formatNumber(b)}`;
    const result = eval(leftSide);
    // Round result to 3 decimal places
    const roundedResult = Math.round(result * 100) / 100;
    const rightSide = `= ${formatNumber(roundedResult)}`;
    equations.push([leftSide, rightSide]);
  }

  return equations;
};
