import React, { useEffect } from "react"
import { View, Pressable, TouchableHighlight, TouchableOpacity, Text } from "react-native"
import { FriendsScreenProps } from "../../types/types"
import { AntDesign } from '@expo/vector-icons';
import { WelcomeScreen } from "./components/WelcomeScreen"
import { FriendsList } from "./components/FriendsList"
import { GetFriends } from "../../api/friend";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../lib/redux/store";
import { setValue as setFriends } from '../../lib/redux/friendsSlice'
import { useIsFocused } from "@react-navigation/native";

export function FriendsScreen({ navigation }: FriendsScreenProps) {
    const friends = useSelector((state: RootState) => state.friends.value)
    const dispatch = useDispatch()
    const isFocused = useIsFocused()

    useEffect(() => {
        if (isFocused) {
            GetFriends().then(friends => dispatch(setFriends(friends)))
        }
    }, [isFocused]);

    return (
        <View className="bg-white h-full relative">
            <View className="w-full h-[10%] flex-row mt-4 pr-4" >
                <TouchableHighlight underlayColor="rgb(226, 232, 240)" className="ml-auto mt-auto mb-auto w-[40px] h-[40px] rounded-full flex-row justify-center" onPress={() => navigation.navigate("AddFriendScreen")}>
                    <View className="m-auto">
                        <AntDesign name="adduser" size={24} color="gray" />
                    </View>
                </TouchableHighlight>
            </View>
            <View className="bg-slate-300 h-[2px] w-full mb-[2%]" />
            {!friends || friends.length === 0 ? <WelcomeScreen /> : <FriendsList friends={friends} />}
            <TouchableOpacity onPress={() => {
                navigation.navigate("AddExpenseScreen")
            }} className="absolute bottom-5 right-5 h-12 w-36 bg-[#5BC5A7] flex-row justify-center rounded-full shadow-lg shadow-black">
                <Text className="text-base font-semibold text-white mt-auto mb-auto">Add Expense</Text>
            </TouchableOpacity>
        </View>
    )
}