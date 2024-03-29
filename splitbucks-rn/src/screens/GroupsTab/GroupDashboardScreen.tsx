import React, { useEffect } from "react"
import { View, Pressable } from "react-native"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../../lib/redux/store"
import { Group, GroupDashboardProps } from "../../types/types"
import { AntDesign } from '@expo/vector-icons';
import { WelcomeScreen } from "./components/WelcomeScreen"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { GoogleSignin } from "@react-native-google-signin/google-signin"
import { GetUserGroups } from "../../api/group"
import { GroupsList } from "./components/GroupList"
import { setValue as setGroups } from '../../lib/redux/groupsSlice'
import { useIsFocused } from "@react-navigation/native"

export function GroupDashboardScreen({ navigation }: GroupDashboardProps) {
    const groups = useSelector((state: RootState) => state.groups.value)
    const dispatch = useDispatch()

    useEffect(() => {
        GetUserGroups().then(groups => dispatch(setGroups(groups)))
    }, []);

    return (
        <View className="bg-white h-full">
            <View className="w-full h-[10%] flex-row pr-4" >
                <Pressable className="ml-auto mt-auto mb-auto"><AntDesign name="search1" size={24} color="gray" /></Pressable>
                <Pressable className="ml-6 mt-auto mb-auto " onPress={() => navigation.navigate('CreateGroupScreen')}><AntDesign name="addusergroup" size={24} color="gray" /></Pressable>
            </View>
            <View className="bg-slate-300 h-[2px] w-full mb-[2%]" />
            {groups.length === 0 ? <WelcomeScreen /> : <GroupsList groups={groups} />}
        </View>
    )
}
