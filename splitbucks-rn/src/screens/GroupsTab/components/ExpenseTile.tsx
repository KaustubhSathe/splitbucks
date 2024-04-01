import { Text, TouchableOpacity, View } from "react-native";
import { Expense, User } from "../../../types/types";

export function ExpenseTile({ expense, user }: { expense: Expense, user: User }) {
    const subDescription = expense?.SplitMembers?.includes(user.PK) ? `${expense.PaidByName} paid ${expense.Amount}` : "You are not involved"
    const expenseTransaction = expense?.SplitMembers?.includes(user.PK) ?
        expense.PaidById === user.PK ?
            <Text className="text-green-500 mt-auto mb-auto">you lent {expense.Amount}</Text> :
            <Text className="text-red-500 mt-auto mb-auto">you borrowed {expense?.Split?.[`${user.PK}:${expense.PaidById}`]}</Text>
        : <Text className="text-slate-500 mt-auto mb-auto">non involved</Text>


    return <TouchableOpacity className="flex flex-row justify-between pt-2 pb-2">
        <Text className="text-slate-500 mt-auto mb-auto">{new Date(expense.ExpenseDate).toLocaleDateString()}</Text>
        <View className="flex mt-auto mb-auto">
            <Text className="text-base font-medium">{expense.Description}</Text>
            <Text className="font-normal text-sm text-slate-500">{subDescription}</Text>
        </View>
        {expenseTransaction}
    </TouchableOpacity>
}