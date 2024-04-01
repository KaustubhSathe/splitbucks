import { API_DOMAIN } from "@env"
import { RetryHelper } from "../helper"
import { Expense } from "../../types/types"
import AsyncStorage from "@react-native-async-storage/async-storage"

const GROUP_EXPENSES = (groupID: string) => `group_expenses_${groupID}`

export async function AddExpense(
    description: string,
    amount: number,
    currency: string,
    paidById: string,
    paidByName: string,
    splitType: string,
    split: Object,
    expenseDate: Date,
    note: string,
    splitMembers: string[],
    expenseType: string,
    groupID: string,
    groupName: string,
) {
    const res = await RetryHelper<Expense>(`${API_DOMAIN}/api/add_expense`, {
        method: "POST",
        body: JSON.stringify({
            Description: description,
            Amount: amount,
            Currency: currency,
            PaidById: paidById,
            PaidByName: paidByName,
            SplitType: splitType,
            Split: split,
            ExpenseDate: expenseDate,
            Note: note,
            SplitMembers: splitMembers,
            ExpenseType: expenseType,
            GroupID: groupID,
            GroupName: groupName,
        })
    })
    await AsyncStorage.removeItem(GROUP_EXPENSES(groupID))
    return res
}


export async function GetGroupExpenses(groupID: string): Promise<Expense[]> {
    let expenses: Expense[] = JSON.parse(await AsyncStorage.getItem(GROUP_EXPENSES(groupID)))
    if (expenses) {
        return expenses;
    }
    expenses =  await RetryHelper<Expense[]>(`${API_DOMAIN}/api/group_expenses`, {
        method: "POST",
        body: JSON.stringify({
            GroupID: groupID,
        })
    })
    await AsyncStorage.setItem(GROUP_EXPENSES(groupID), JSON.stringify(expenses))
    return expenses
}