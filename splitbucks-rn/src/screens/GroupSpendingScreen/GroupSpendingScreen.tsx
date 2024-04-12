import { useRoute } from "@react-navigation/native";
import { Text, View } from "react-native";
import { GroupExpenseScreenProps, GroupSpendingScreenProps } from "../../types/types";
import { useEffect, useState } from "react";

export function GroupSpendingScreen() {
    const route = useRoute<GroupSpendingScreenProps['route']>();
    const expenses = route.params.groupExpenses
    const user = route.params.user
    const group = route.params.group
    const [totalAmountPaidByUser, setTotalAmountPaidByUser] = useState<number>(0.0);
    const [totalGroupSpending, setTotalGroupSpending] = useState<number>(0.0);

    useEffect(() => {
        let userSpend = 0.0
        let groupSpend = 0.0
        expenses.forEach(ex => {
            if (ex.PaidById === user?.PK) {
                userSpend += ex.Amount
            }
            groupSpend += ex.Amount
        })
        setTotalGroupSpending(groupSpend)
        setTotalAmountPaidByUser(userSpend)
    }, [])

    return <View className="p-4">
        <Text className="text-4xl">{group.GroupName}</Text>
        <Text className="text-xl">Total group spending: {totalGroupSpending.toFixed(2)}</Text>
        <Text className="text-xl">Total you paid for: {totalAmountPaidByUser.toFixed(2)}</Text>
    </View>
}