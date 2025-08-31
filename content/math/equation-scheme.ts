const findDivisors = (number: number): number[] => {
  const divisors = [];
  for (let i = 1; i <= number; i++) {
    if (number % i === 0) {
      divisors.push(i);
    }
  }
  return divisors;
};

const gcd = (a: number, b: number): number => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
};

const lcm = (a: number, b: number): number => (a / gcd(a, b)) * b;

const simplifyFraction = (num: number, den: number): [number, number] => {
  if (den === 0) return [num, 1];
  const g = gcd(num, den);
  let n = num / g;
  let d = den / g;
  if (d < 0) {
    n = -n;
    d = -d;
  }
  return [n, d];
};

const fractionToString = (num: number, den: number): string => {
  const [n, d] = simplifyFraction(num, den);
  if (d === 1) return `${n}`;
  return `${n}/${d}`;
};

const fractionToMixedString = (num: number, den: number): string => {
  const [n, d] = simplifyFraction(num, den);
  if (d === 1) return `${n}`;
  const absN = Math.abs(n);
  const whole = Math.floor(absN / d);
  const rem = absN % d;
  const sign = n < 0 ? '-' : '';
  if (whole === 0) return `${n}/${d}`; // proper fraction (keeps sign on numerator)
  if (rem === 0) return `${sign}${whole}`; // exact integer
  return `${sign}${whole} ${rem}/${d}`;
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

export const buildDecimalDefinitions = (numberLimit: number, count: number) => {
  // Simple, illustrative decimal equations: divide by 5, 10, or 100
  const equations: string[][] = [];
  const divisors = [5, 10, 100];

  const formatNumber = (n: number) => {
    const rounded = Math.round(n * 100) / 100;
    return rounded.toString();
  };

  for (let i = 0; i < count; i++) {
    const divisor = divisors[Math.floor(Math.random() * divisors.length)];
    // Prefer integers to clearly demonstrate place value / simple decimals
    const maxA = Math.max(10, numberLimit || 10) * (divisor === 100 ? 2 : 1);
    const a = Math.floor(Math.random() * maxA) + 1;

    const leftSide = `${a} / ${divisor}`;
    const result = eval(leftSide);
    const rightSide = `= ${formatNumber(result)}`;
    equations.push([leftSide, rightSide]);
  }

  return equations;
};

export const buildDecimalEquations = (day: number, numberLimit: number, count: number) => {
  const equations = [];
  const operators = [];
  // Day 1 shows definitions; operators start from day 2
  if (day === 1) {
    return buildDecimalDefinitions(10, count);
  }
  switch (day) {
    case 2:
      operators.push('+');
      break;
    case 3:
      operators.push('-');
      break;
    case 4:
      operators.push('*');
      break;
    case 5:
      operators.push('/');
      break;
    default:
      operators.push('+', '-', '*', '/');
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

export const buildFractionEquations = (day: number, numberLimit: number, count: number) => {
  const equations: string[][] = [];
  const operators: Array<'+' | '-' | '*' | '/'> = [];
  // Day 1 shows definitions; operators start from day 2
  if (day === 1) {
    return buildFractionDefinitions(numberLimit, count);
  }
  switch (day) {
    case 2:
      operators.push('+');
      break;
    case 3:
      operators.push('-');
      break;
    case 4:
      operators.push('*');
      break;
    case 5:
      operators.push('/');
      break;
    default:
      operators.push('+', '-', '*', '/');
      break;
  }

  const maxDen = Math.max(2, Math.min(numberLimit || 12, 12));

  const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  for (let i = 0; i < count; i++) {
    const operator = operators[Math.floor(Math.random() * operators.length)];

    // Pick fractions
    let d1 = randInt(2, maxDen);
    let d2: number;

    if (operator === '+' || operator === '-') {
      // Prefer related denominators for nicer sums/differences
      const factors = [1, 2, 3, 4].filter((f) => d1 * f <= maxDen);
      const f = factors.length > 0 ? factors[Math.floor(Math.random() * factors.length)] : 1;
      d2 = d1 * f;
    } else {
      d2 = randInt(2, maxDen);
    }

    let n1 = randInt(1, d1 - 1);
    let n2 = randInt(1, d2 - 1);

    // Avoid trivial zero results for subtraction if possible
    if (operator === '-' && n1 * d2 === n2 * d1) {
      n2 = Math.max(1, (n2 % (d2 - 1)) + 1);
    }

    // Ensure non-negative result for subtraction by ordering
    if (operator === '-' && n1 * d2 < n2 * d1) {
      [n1, n2] = [n2, n1];
      [d1, d2] = [d2, d1];
    }

    let resNum = 0;
    let resDen = 1;
    switch (operator) {
      case '+': {
        const L = lcm(d1, d2);
        resNum = n1 * (L / d1) + n2 * (L / d2);
        resDen = L;
        break;
      }
      case '-': {
        const L = lcm(d1, d2);
        resNum = n1 * (L / d1) - n2 * (L / d2);
        resDen = L;
        break;
      }
      case '*': {
        resNum = n1 * n2;
        resDen = d1 * d2;
        break;
      }
      case '/': {
        // (n1/d1) ÷ (n2/d2) = (n1*d2) / (d1*n2)
        resNum = n1 * d2;
        resDen = d1 * n2;
        break;
      }
    }

    const [sNum, sDen] = simplifyFraction(resNum, resDen);
    const leftSide = `${fractionToString(n1, d1)} ${operator} ${fractionToString(n2, d2)}`;
    const rightSide = `= ${fractionToMixedString(sNum, sDen)}`;
    equations.push([leftSide, rightSide]);
  }

  return equations;
};

export const buildFractionDefinitions = (numberLimit: number, count: number) => {
  // Simple fraction equations demonstrating like-denominator addition/subtraction
  // e.g., 1/4 + 2/4 = 3/4, 5/6 - 1/6 = 4/6 = 2/3
  const equations: string[][] = [];

  const maxDen = Math.max(2, Math.min(numberLimit || 12, 12));
  const preferred = [2, 3, 4, 5, 6, 8, 10, 12].filter((d) => d <= maxDen);
  const pickDen = () => preferred[Math.floor(Math.random() * preferred.length)] || 2;

  for (let i = 0; i < count; i++) {
    const d = pickDen();
    const op: '+' | '-' = Math.random() < 0.5 ? '+' : '-';
    let n1 = Math.max(1, Math.floor(Math.random() * (d - 1)));
    let n2: number;
    if (op === '+') {
      // Usually keep simple sums (n1 + n2 <= d),
      // sometimes allow improper to demonstrate mixed numbers.
      const allowImproper = Math.random() < 0.35; // 35% chance
      const maxN2 = allowImproper ? d - 1 : Math.max(1, d - n1);
      n2 = Math.max(1, Math.floor(Math.random() * maxN2));
    } else {
      n2 = Math.max(1, Math.floor(Math.random() * (d - 1)));
      if (n1 < n2) {
        [n1, n2] = [n2, n1];
      }
    }

    let resNum = op === '+' ? n1 + n2 : n1 - n2;
    let resDen = d;
    const [sNum, sDen] = simplifyFraction(resNum, resDen);

    const leftSide = `${fractionToString(n1, d)} ${op} ${fractionToString(n2, d)}`;
    const rightSide = `= ${fractionToMixedString(sNum, sDen)}`;
    equations.push([leftSide, rightSide]);
  }

  return equations;
};

export const buildPercentageEquations = (day: number, numberLimit: number, count: number) => {
  // Only one operator for percentages: "z" ("from" in Polish)
  // Ensure result (a% of b) is always an integer using gcd.
  const equations: string[][] = [];

  const randInt = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const maxBase = Math.max(1, Math.floor(numberLimit || 100));
  // Allow up to 1 occurrence of 100% per each 5 items
  const allowedHundreds = Math.floor(count / 5);
  // Precompute bases that share a factor with 100 (so a can be != 100)
  const friendlyBases: number[] = [];
  for (let bb = 1; bb <= maxBase; bb++) {
    if (gcd(100, bb) > 1) friendlyBases.push(bb);
  }
  let usedHundreds = 0;

  for (let i = 0; i < count; i++) {
    // Choose base b freely within limit
    const avoidHundred = usedHundreds >= allowedHundreds;
    const b = avoidHundred && friendlyBases.length > 0
      ? friendlyBases[randInt(1, friendlyBases.length) - 1]
      : randInt(1, maxBase);
    // Pick a so that (a*b) is divisible by 100
    const g = gcd(100, b);
    const step = 100 / g; // a must be a multiple of step
    const maxK = Math.max(1, Math.floor(100 / step));
    // If we've already used 100%, avoid picking 100 again when possible
    const k = avoidHundred && maxK > 1 ? randInt(1, maxK - 1) : randInt(1, maxK);
    const a = step * k; // 1..100 and guarantees integer result

    const leftSide = `${a}% z ${b}`;
    const result = (a * b) / 100; // guaranteed integer
    const rightSide = `= ${result}`;
    equations.push([leftSide, rightSide]);

    if (a === 100) usedHundreds += 1;
  }

  return equations;
};
