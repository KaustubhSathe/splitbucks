import { useNavigation, useRoute } from "@react-navigation/native";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { GroupExpenseScreenProps, RootParamList, User } from "../../types/types";
import React, { useEffect, useState } from "react";
import { GetMembers } from "../../api/group";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Authenticate } from "../../api/profile";

export function GroupExpenseScreen() {
    const route = useRoute<GroupExpenseScreenProps['route']>();
    const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
    const owes = route.params.group.Owes
    const groupID = route.params.group.PK
    const [members, setMembers] = useState<User[]>([]);
    const [user, setUser] = useState<User>();
    const [settleStatements, setSettleStatements] = useState<{
        ower: string,
        owed: string,
        amount: number
    }[]>([]);

    useEffect(() => {
        Authenticate().then(user => {
            setUser(user)
            // Now calculate how much each member owes or is owed by logged in user
            GetMembers(groupID).then(members => {
                setMembers(members)
                const statements: {
                    ower: string,
                    owed: string,
                    amount: number
                }[] = [];
                members?.forEach(mm => {
                    if (mm.PK !== user.PK) {
                        const mmOwesUser = owes?.get(`${mm.PK}:${user.PK}`) ? owes?.get(`${mm.PK}:${user.PK}`) : 0
                        const userOwesMm = owes?.get(`${user.PK}:${mm.PK}`) ? owes?.get(`${user.PK}:${mm.PK}`) : 0
                        if (userOwesMm - mmOwesUser > 0) {
                            statements.push({
                                amount: userOwesMm - mmOwesUser,
                                owed: mm.Name,
                                ower: "You"
                            })
                        } else if (userOwesMm - mmOwesUser < 0) {
                            statements.push({
                                amount: userOwesMm - mmOwesUser,
                                owed: user.Name,
                                ower: mm.Name
                            })
                        }
                    }
                })
                setSettleStatements(statements)
            })
        })
    }, [])

    return (
        <View className="bg-white h-full">
            <View className="w-full h-[8%]  flex-row mt-4 pl-4 pr-4 justify-between">
                <TouchableOpacity className="mt-auto mb-auto" onPress={() => navigation.navigate("GroupDashboardScreen")}>
                    <Ionicons name="arrow-back-outline" size={28} color="black" />
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.7} className="mt-auto mb-auto" onPress={() => navigation.navigate("GroupSettingsScreen", {
                    group: route.params?.group
                })}>
                    <Ionicons name="settings-outline" size={28} color="black" />
                </TouchableOpacity>
            </View>
            <View className="bg-slate-300 h-[2px] w-full mb-[2%]" />
            <Text className="ml-4 text-2xl font-normal">{route.params?.group?.GroupName}</Text>
            {
                settleStatements.length === 0 ?
                    <Text className="ml-4 mt-2">You are all settled up.</Text>
                    : settleStatements.map(x => x.amount > 0
                        ? <Text>You owe {x.owed} {x.amount}</Text>
                        : <Text>{x.owed} owes you {x.amount}</Text>
                    )
            }
        </View>
    )
}