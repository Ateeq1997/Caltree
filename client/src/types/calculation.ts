export interface CalculationNode {
  id: string;
  result: number;
  operation?: string;
  rightOperand?: number;
  children: CalculationNode[];
}
