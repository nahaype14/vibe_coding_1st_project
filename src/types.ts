export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  note?: string;
}

export const EXPENSE_CATEGORIES = [
  "Еда",
  "Транспорт",
  "Жильё",
  "Здоровье",
  "Развлечения",
  "Одежда",
  "Связь и интернет",
  "Образование",
  "Прочее",
] as const;

export const INCOME_CATEGORIES = [
  "Зарплата",
  "Подработка",
  "Подарки",
  "Инвестиции",
  "Возврат долга",
  "Прочее",
] as const;

export const CURRENCIES = [
  { code: "RUB", label: "₽ Рубль" },
  { code: "USD", label: "$ Доллар" },
  { code: "EUR", label: "€ Евро" },
  { code: "KZT", label: "₸ Тенге" },
  { code: "UAH", label: "₴ Гривна" },
  { code: "BYN", label: "Br Белорусский рубль" },
  { code: "GBP", label: "£ Фунт" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];
