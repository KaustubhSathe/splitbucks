import React, { useEffect } from "react"
import { View, Pressable, TouchableOpacity, Text } from "react-native"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../../lib/redux/store"
import { GroupDashboardProps } from "../../types/types"
import { AntDesign } from '@expo/vector-icons';
import { WelcomeScreen } from "./components/WelcomeScreen"
import { GetUserGroups } from "../../api/group"
import { GroupsList } from "./components/GroupList"
import { setValue as setGroups } from '../../lib/redux/groupsSlice'
import { useIsFocused } from "@react-navigation/native"

export function GroupDashboardScreen({ navigation }: GroupDashboardProps) {
    const groups = useSelector((state: RootState) => state.groups.value)
    const dispatch = useDispatch()
    const isFocused = useIsFocused()

    useEffect(() => {
        GetUserGroups().then(groups => dispatch(setGroups([...groups.filter(x => x.SK !== "GROUP#NONGROUP"), ...groups.filter(x => x.SK === "GROUP#NONGROUP")])))
    }, [isFocused]);

    return (
        <View className="bg-white h-full relative">
            <View className="w-full h-[10%] flex-row pr-4" >
                <Pressable className="ml-auto mt-auto mb-auto " onPress={() => navigation.navigate('CreateGroupScreen')}><AntDesign name="addusergroup" size={24} color="gray" /></Pressable>
            </View>
            <View className="bg-slate-300 h-[2px] w-full mb-[2%]" />
            {groups.length === 0 ? <WelcomeScreen /> : <GroupsList />}
            <TouchableOpacity onPress={() => {
                navigation.navigate("AddExpenseScreen")
            }} className="absolute bottom-5 right-5 h-12 w-36 bg-[#5BC5A7] flex-row justify-center rounded-full shadow-lg shadow-black">
                <Text className="text-base font-semibold text-white mt-auto mb-auto">Add Expense</Text>
            </TouchableOpacity>
        </View>
    )
}
