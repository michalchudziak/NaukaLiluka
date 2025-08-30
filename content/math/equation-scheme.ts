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
