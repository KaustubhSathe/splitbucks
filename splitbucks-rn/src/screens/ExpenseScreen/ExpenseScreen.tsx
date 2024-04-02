import React, { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AdjustSplitScreenProps, ExpenseScreenProps, RootParamList, User } from "../../types/types";
import { GetMembers } from "../../api/group";

export function ExpenseScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
    const route = useRoute<ExpenseScreenProps['route']>()
    const user = route.params.user
    const expense = route.params.expense
    const [membersMap, setMembersMap] = useState<Map<string, User>>();

    useEffect(() => {
        GetMembers(expense.GroupID).then(members => setMembersMap(new Map<string, User>(members.map(x => [x.PK, x]))))
    }, [])

    return <View className="bg-white h-full relative">
        <View className="w-full h-[8%]  flex-row mt-4 pl-4 pr-4 justify-between">
            <TouchableOpacity className="mt-auto mb-auto" onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back-outline" size={28} color="black" />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7} className="ml-auto mr-4 mt-auto mb-auto" onPress={() => { }}>
                <AntDesign name="delete" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7} className="mt-auto mb-auto" onPress={() => { }}>
                <Feather name="edit-2" size={24} color="black" />
            </TouchableOpacity>
        </View>
        <View className="bg-slate-300 h-[2px] w-full mb-[2%]" />
        <View className="p-4">
            <Text className="text-2xl font-semibold">{expense?.Description}</Text>
            <Text className="text-base font-normal">{expense?.Currency}.{expense?.Amount}</Text>
            <Text>Added by {expense.AddedByID === user.PK ? "you" : expense.AddedByName} on {new Date(expense.CreatedAt).toLocaleDateString()}</Text>
            {
                new Date(expense.CreatedAt).getTime() === new Date(expense.UpdatedAt).getTime()
                    ? null
                    : <Text>Updated by {expense.AddedByID === user.PK ? "you" : expense.AddedByName} on {new Date(expense.CreatedAt).toLocaleDateString()}</Text>
            }
            <Text>{expense.PaidById === user.PK ? "You" : expense.PaidByName} paid {expense?.Currency}.{expense?.Amount}</Text>
            {membersMap && expense?.SplitMembers.map(x => <Text key={x}> - {membersMap?.get(x).PK === user?.PK ? "You" : membersMap?.get(x).Name} owes {expense?.Split[`${x}:${expense.PaidById}`]}</Text>)}
        </View>
        <View className="w-full h-[7%] mt-auto bg-slate-200 flex-row justify-evenly">
            <TextInput className="w-[85%] h-[80%] mt-auto mb-auto bg-white rounded-full pl-4" placeholder="Add a comment" />
            <TouchableOpacity className="mt-auto mb-auto">
                <AntDesign name="arrowright" size={24} color="black" />
            </TouchableOpacity>
        </View>
    </View >
}