import { useIsFocused, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Text, TouchableHighlight } from "react-native";
import { Group, RootParamList, User } from "../../../types/types";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Authenticate } from "../../../api/profile";
import { GetGroupExpenses } from "../../../api/expense";

export function GroupTile({ group }: { group: Group }) {
    const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
    const [owedAmount, setOwedAmount] = useState<number>(0.0);
    const isFocused = useIsFocused();

    useEffect(() => {
        Authenticate()
            .then(user => {
                // Owed amount calculation
                if (group.Owes && group.SK !== "GROUP#NONGROUP") {
                    let owedAmount = 0.0;
                    group.Members.forEach(member => {
                        const x1 = group?.Owes[`${member}:${user?.PK}`] ?? 0
                        const x2 = group?.Owes[`${user?.PK}:${member}`] ?? 0
                        owedAmount += x1 - x2 
                    })
                    setOwedAmount(owedAmount)
                }

                if (group.Owes && group.SK === "GROUP#NONGROUP") {
                    let owedAmount = 0.0;
                    GetGroupExpenses("", "NONGROUP").then(expenses => {
                        expenses.forEach(ex => {
                            ex.SplitMembers.forEach(member => {
                                const x1 = ex?.Split[`${member}:${user?.PK}`] ?? 0
                                const x2 = ex?.Split[`${user?.PK}:${member}`] ?? 0
                                owedAmount += x1 - x2
                            })
                            setOwedAmount(owedAmount)
                        })
                    })
                }
            })
    }, [isFocused])

    return (
        <TouchableHighlight underlayColor="rgb(226, 232, 240)" onPress={() => {
            navigation.navigate("GroupExpenseScreen", {
                group: group,
            })
        }} className="bg-sl w-ful flex-col p-2 h-16 border-[0.5px]">
            <>
                <Text className="ml-4 mt-auto mb-auto text-lg font-semibold">{group.GroupName}</Text>
                {owedAmount >= 0.0 ?
                    <Text className="ml-4 mt-auto mb-auto text-lg font-semibold text-green-500">You are owed: {owedAmount.toFixed(0)}</Text> :
                    <Text className="ml-4 mt-auto mb-auto text-lg font-semibold text-red-500">You owe: {owedAmount.toFixed(0)}</Text>
                }
            </>
        </TouchableHighlight>
    )
}