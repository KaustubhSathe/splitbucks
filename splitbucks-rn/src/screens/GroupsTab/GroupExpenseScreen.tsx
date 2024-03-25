import { useRoute } from "@react-navigation/native";
import { Text, View } from "react-native";
import { GroupExpenseScreenProps, User } from "../../types/types";
import React, { useEffect } from "react";
import { GetMembers } from "../../api/group";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function GroupExpenseScreen() {
    const route = useRoute<GroupExpenseScreenProps['route']>();

    useEffect(() => {
        // Fetch all the users of this group
        AsyncStorage.getItem('idToken')
            .then(idToken => {
                if (idToken !== null) {
                    GetMembers(idToken, route.params?.group.SK.slice(6) as string)
                        .then(async res => {
                            if (res.status === 200) {
                                const members: User[] = await res.json()
                                console.log(members)
                            }
                        })
                }
            })
    }, [route])

    return (
        <View className="bg-white h-full">
            <View className="w-full h-[10%] flex-row mt-4 pr-4">
            </View>
            <View className="bg-slate-300 h-[2px] w-full mb-[2%]" />
            <Text className="mt-10 ml-7 text-xl font-normal">{route.params?.group.SK}</Text>
        </View>
    )
}