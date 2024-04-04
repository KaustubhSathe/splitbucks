import { API_DOMAIN } from "@env"
import { RetryHelper } from "../helper"
import { Comment, Expense } from "../../types/types"
import AsyncStorage from "@react-native-async-storage/async-storage"
import exp from "constants"
import { USER_GROUPS } from "../group"

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


export async function GetGroupExpenses(groupID: string, groupType: string): Promise<Expense[]> {
    let expenses: Expense[] = JSON.parse(await AsyncStorage.getItem(GROUP_EXPENSES(groupID)))
    if (expenses) {
        return expenses;
    }
    expenses =  await RetryHelper<Expense[]>(`${API_DOMAIN}/api/group_expenses`, {
        method: "POST",
        body: JSON.stringify({
            GroupID: groupID,
            GroupType: groupType
        })
    })
    await AsyncStorage.setItem(GROUP_EXPENSES(groupID), JSON.stringify(expenses))
    return expenses
}

export async function DeleteExpense(expense: Expense): Promise<Expense> {
    const res =  await RetryHelper<Expense>(`${API_DOMAIN}/api/expense`, {
        method: "DELETE",
        body: JSON.stringify({
            Expense: expense,
        })
    })
    await AsyncStorage.removeItem(USER_GROUPS)
    await AsyncStorage.removeItem(GROUP_EXPENSES(expense.GroupID))
    return res
}

const EXPENSE_COMMENTS = (id) => `comments_${id}`

export async function CreateComment(comment: string, expenseID: string): Promise<Comment> {
    let res: Comment = await RetryHelper<Comment>(`${API_DOMAIN}/api/comment`, {
        method: "POST",
        body: JSON.stringify({
            Comment: comment,
            ExpenseID: expenseID
        })
    })
    await AsyncStorage.removeItem(EXPENSE_COMMENTS(expenseID))
    return res
}

export async function GetComments(expenseID: string): Promise<Comment[]> {
    let comments: Comment[] = JSON.parse(await AsyncStorage.getItem(EXPENSE_COMMENTS(expenseID)))
    if (comments) {
        return comments
    }
    comments = await RetryHelper<Comment[]>(`${API_DOMAIN}/api/comment?expense_id=${encodeURIComponent(expenseID)}`, {
        method: "GET",
    })
    return comments
}