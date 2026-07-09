export type CategoryType = 'income' | 'expense' | 'both';
export type MovementType = 'income' | 'expense' | 'purchase' | 'transfer' | 'adjustment';
export type RecommendationLevel = 'positivo' | 'advertencia' | 'critico';

export interface FinanceAccount {
  id: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  type: CategoryType;
  color?: string;
  icon?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Movement {
  id: number;
  account_id?: number;
  type: MovementType;
  amount: number;
  date: string;
  category_id: number;
  category_name?: string;
  category_color?: string;
  payment_method?: string;
  description: string;
  notes?: string;
  tag?: string;
  place?: string;
  is_necessary: boolean;
  is_recurring: boolean;
  created_at: string;
  updated_at: string;
}

export interface MovementInput {
  account_id?: number;
  type: MovementType;
  amount: number;
  date: string;
  category_id: number;
  payment_method?: string;
  description: string;
  notes?: string;
  tag?: string;
  place?: string;
  is_necessary: boolean;
  is_recurring: boolean;
}

export interface CategoryBudget {
  id?: number;
  category_id: number;
  category_name?: string;
  amount_limit: number;
}

export interface Budget {
  id: number;
  account_id?: number;
  year: number;
  month: number;
  total_budget: number;
  saving_goal: number;
  unnecessary_expense_limit: number;
  category_budgets: CategoryBudget[];
  created_at: string;
  updated_at: string;
}

export interface Recommendation {
  title: string;
  explanation: string;
  affected_value: number;
  suggested_action: string;
  level: RecommendationLevel;
}

export interface MonthlySummary {
  year: number;
  month: number;
  total_income: number;
  total_expense: number;
  balance: number;
  saving_amount: number;
  saving_rate: number | null;
  expense_rate: number | null;
  average_daily_expense: number;
  highest_expense_day?: { date: string; amount: number };
  top_expense_category?: { category_id: number; category: string; color: string; amount: number };
  necessary_expenses: number;
  unnecessary_expenses: number;
  category_expenses: { category_id: number; category: string; color: string; amount: number }[];
  top_expenses: { id: number; date: string; description: string; amount: number; category_id: number }[];
  budget?: Budget | null;
  messages: string[];
}

export interface MonthlyData {
  summary: MonthlySummary;
  comparison: any;
  recommendations: Recommendation[];
}
