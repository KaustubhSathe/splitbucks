import { useNavigation, useRoute } from "@react-navigation/native";
import { Image, Share, Text, TouchableOpacity, View } from "react-native";
import { Expense, FriendExpenseScreenProps, Group, RootParamList, User } from "../../types/types";
import React, { useEffect, useState } from "react";
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { GetUserGroups } from "../../api/group";
import { Authenticate } from "../../api/profile";
import { GetGroupExpenses } from "../../api/expense";
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';


export function FriendExpenseScreen() {
    const route = useRoute<FriendExpenseScreenProps['route']>();
    const friend = route.params.friend
    const user = route.params.user
    const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
    const [sharedGroups, setSharedGroups] = useState<Group[]>([]);
    const [nonSharedExpenses, setNonSharedExpenses] = useState<Expense[]>([]);
    const settleStatements: string[] = sharedGroups.reduce((tot, gr) => {
        const owedAmount = (gr.Owes[`${friend.PK}:${user.PK}`] ?? 0) - (gr.Owes[`${user.PK}:${friend.PK}`] ?? 0);
        if (owedAmount !== 0.0) {
            const ss = owedAmount >= 0.0 ? `${friend.Name} owes you ${owedAmount} in group ${gr.GroupName}` : `You owe ${friend.Name} ${owedAmount} in group ${gr.GroupName}`
            return [...tot, ss]
        }
        return tot
    }, [] as string[])

    const total = nonSharedExpenses.reduce((tot, ex) => tot + (ex.Split[`${friend.PK}:${user.PK}`] ?? 0) - (ex.Split[`${user.PK}:${friend.PK}`] ?? 0), 0)
    if (total !== 0.0) {
        const ss = total >= 0.0 ? `${friend.Name} owes you ${total} in non-group expenses.` : `You owe ${friend.Name} ${total} in non-group expenses.`
        settleStatements.push(ss)
    }

    useEffect(() => {
        GetUserGroups().then(groups => {
            setSharedGroups(groups.filter(gr => gr.Members.includes(friend.PK)))
        })
        // Also fetch the non-group expenses
        GetGroupExpenses("", "NONGROUP").then(expenses => {
            setNonSharedExpenses(expenses.filter(x => x.SplitMembers.includes(friend.PK)))
        })
    }, [friend])

    return (
        <View className="bg-white h-full">
            <View className="w-full h-[10%] flex-row mt-4  pl-4 pr-4 justify-between">
                <TouchableOpacity className="mt-auto mb-auto" onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back-outline" size={28} color="black" />
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.7} className="mt-auto mb-auto" onPress={() => navigation.navigate("FriendSettingsScreen", {
                    friend: friend
                })}>
                    <Ionicons name="settings-outline" size={28} color="black" />
                </TouchableOpacity>
            </View>
            <View className="relative">
                <View className="bg-slate-300 h-[2px] w-full mb-[2%]" />
                <Image
                    className="absolute left-10 top-[-20]"
                    source={{ uri: route.params?.friend.Picture }}
                    width={60} height={60}
                    borderRadius={100}
                />
            </View>
            <Text className="mt-10 ml-7 text-xl font-normal">{route.params?.friend.Name}</Text>
            {
                settleStatements.length === 0 ? <Text className="ml-4 mt-2">You are all settled up.</Text>
                    : settleStatements.map(x => <Text className="ml-4 mt-2" key={x}>{x}</Text>)
            }
            <View className="p-4">
                {sharedGroups.map(gr => <SharedGroupTile key={gr.SK} group={gr} friend={friend} />)}
            </View>
            <View className="p-4">
                {nonSharedExpenses.map(ex => <NonSharedExpense friend={friend} key={ex.SK} expense={ex} />)}
            </View>
        </View>
    )
}

function NonSharedExpense({ expense, friend }: { expense: Expense, friend: User }) {
    const [owedAmount, setOwedAmount] = useState<number>(0.0);
    const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
    const [user, setUser] = useState<User>();

    useEffect(() => {
        Authenticate().then(user => {
            setUser(user)
            // Owed amount calculation 
            const userPK = user.PK
            const friendPK = friend.PK
            const amount = expense.Split[`${friendPK}:${userPK}`] ?? 0 - expense.Split[`${userPK}:${friendPK}`] ?? 0
            setOwedAmount(amount)
        })
    }, [friend])

    return <TouchableOpacity className="flex-row justify-between" onPress={() => navigation.navigate("ExpenseScreen", {
        expense: expense,
        user: user
    })}>
        <View className="flex-row mt-auto mb-auto">
            <Text className="mt-auto mb-auto">{new Date(expense.CreatedAt).toLocaleDateString()}</Text>
            <View className="ml-4 mt-auto mb-auto">
                <Text className="text-base font-semibold">{expense.Description}</Text>
                <Text className="text-slate-500">{expense.PaidById === friend.PK ? expense.PaidByName : "You"} paid {expense.Amount}</Text>
            </View>
        </View>
        {owedAmount === 0.0
            ? <Text className="mt-auto mb-auto text-slate-500">settled up</Text>
            : owedAmount > 0
                ? <Text className="mt-auto mb-auto text-green-500">You lent {owedAmount}</Text> : <Text className="mt-auto mb-auto text-red-500">You borrowed {owedAmount}</Text>}
    </TouchableOpacity>
}

function SharedGroupTile({ group, friend }: { group: Group, friend: User }) {
    const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
    const [owedAmount, setOwedAmount] = useState<number>(0.0);

    useEffect(() => {
        Authenticate().then(user => {
            // Owed amount calculation 
            const userPK = user.PK
            const friendPK = friend.PK
            const amount = (group.Owes[`${friendPK}:${userPK}`] ?? 0) - (group.Owes[`${userPK}:${friendPK}`] ?? 0)
            setOwedAmount(amount)
        })
    }, [group, friend])

    return <TouchableOpacity className="flex-row justify-between" onPress={() => navigation.navigate("GroupExpenseScreen", {
        group: group
    })}>
        <View className="flex-row mt-auto mb-auto">
            <Text className="mt-auto mb-auto">{new Date(group.CreatedAt).toLocaleDateString()}</Text>
            <View className="ml-4 mt-auto mb-auto">
                <Text className="text-base font-semibold">{group.GroupName}</Text>
                <Text className="text-slate-500">Shared group</Text>
            </View>
        </View>
        {owedAmount === 0.0
            ? <Text className="mt-auto mb-auto text-slate-500">settled up</Text>
            : owedAmount > 0
                ? <Text className="mt-auto mb-auto text-green-500">You lent {owedAmount}</Text> : <Text className="mt-auto mb-auto text-red-500">You borrowed {owedAmount}</Text>}
    </TouchableOpacity>
}