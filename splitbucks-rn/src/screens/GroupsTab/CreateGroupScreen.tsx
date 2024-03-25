import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { AntDesign } from '@expo/vector-icons';
import React, { useCallback, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Group, RootParamList } from "../../types/types";
import { CreateGroup } from "../../api/group";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setValue as setGroups } from '../../lib/redux/groupsSlice'
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../lib/redux/store";

export function CreateGroupScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
    const [groupName, setGroupName] = useState<string>("");
    const [invalidGroupName, setInvalidGroupName] = useState<boolean>(false)
    const groups = useSelector((state: RootState) => state.groups.value)
    const dispatch = useDispatch()

    const createGroup = useCallback(async () => {
        if (!groupName) {
            setInvalidGroupName(true)
            return
        }

        const idToken = await AsyncStorage.getItem('idToken')
        if (idToken !== null) {
            const res = await CreateGroup(idToken, groupName)
            if (res.status === 200) {
                const group: Group = await res.json()
                dispatch(setGroups([...groups, group]))
                navigation.navigate("GroupExpenseScreen", {
                    group: group,
                })
            }
        }
    }, [groupName, navigation])

    return (
        <View className="bg-white h-full">
            <View className="w-full h-[8%] flex-row mt-4 pl-4 pr-4 justify-between">
                <TouchableOpacity className="mt-auto mb-auto" onPress={() => navigation.goBack()}>
                    <AntDesign name="close" size={30} color="black" />
                </TouchableOpacity>
                <Text className="mt-auto mb-auto text-lg">Create a group</Text>
                <TouchableOpacity activeOpacity={0.7} className="mt-auto mb-auto" onPress={createGroup}>
                    <Text className="font-bold text-base text-[#5BC5A7]">Done</Text>
                </TouchableOpacity>
            </View>
            <View className="bg-slate-300 h-[2px] w-full mb-[2%]" />
            <View className="p-4">
                <View className="mb-4">
                    <Text className="mt-auto mb-auto text-slate-400 text-base font-semibold">Group name</Text>
                    <TextInput className="border-b-[1px]" onChangeText={newValue => setGroupName(newValue)} value={groupName} />
                </View>
                {invalidGroupName && <Text className="mt-4 text-red-500 font-semibold text-lg">Group name cannot be empty!!</Text>}
            </View>
        </View>
    )
}
