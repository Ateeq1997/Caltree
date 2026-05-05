export function calculate(
  left: number,
  operation: string,
  right: number
): number {
  switch (operation) {
    case "+": return left + right;
    case "-": return left - right;
    case "*": return left * right;
    case "/": return left / right;
    default: throw new Error("Invalid operation");
  }
}
