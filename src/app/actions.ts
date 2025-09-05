'use server';

import { suggestExpenseCategory } from '@/ai/flows/suggest-expense-category';

export async function getCategorySuggestion(description: string): Promise<string> {
  if (!description.trim()) {
    return '';
  }
  try {
    const result = await suggestExpenseCategory({ expenseDescription: description });
    return result.suggestedCategory;
  } catch (error) {
    console.error('Error getting category suggestion:', error);
    // Return empty string and let the client side handle the notification
    return '';
  }
}
