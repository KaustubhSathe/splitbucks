import { API_DOMAIN } from "@env"
import { RetryHelper } from "../helper"
import { Expense } from "../../types/types"

export async function AddExpense(
    description: string,
    amount: number,
    currency: string,
    paidBy: string,
    splitType: string,
    split: Map<string, number>,
    expenseDate: Date,
    note: string,
    splitMembers: string[],
    expenseType: string,
    groupID: string,
) {
    return await RetryHelper<Expense>(`${API_DOMAIN}/api/add_expense`, {
        method: "POST",
        body: JSON.stringify({
            Description: description,
            Amount: amount,
            Currency: currency,
            PaidBy: paidBy,
            SplitType: splitType,
            Split: split,
            ExpenseDate: expenseDate,
            Note: note,
            SplitMembers: splitMembers,
            ExpenseType: expenseType,
            GroupID: groupID,
        })
    })
}