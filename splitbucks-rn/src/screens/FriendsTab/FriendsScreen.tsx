import React, { useEffect, useState } from "react"
import { View, Pressable, TouchableHighlight, TouchableOpacity, Text } from "react-native"
import { FriendsScreenProps, User } from "../../types/types"
import { AntDesign } from '@expo/vector-icons';
import { WelcomeScreen } from "./components/WelcomeScreen"
import { FriendsList } from "./components/FriendsList"
import { GetFriends } from "../../api/friend";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";


export function FriendsScreen({ navigation }: FriendsScreenProps) {
    const [friends, setFriends] = useState<User[]>([]);

    useEffect(() => {
        AsyncStorage.getItem('idToken')
            .then(async res => {
                if (res !== null) {
                    GetFriends(res)
                        .then(async res => {
                            if (res.status === 200) {
                                const friends: User[] = await res.json();
                                setFriends(friends)
                            } else if (res.status === 401) {
                                const { idToken } = await GoogleSignin.getTokens()
                                await AsyncStorage.setItem('idToken', idToken)
                                AsyncStorage.getItem('idToken')
                                    .then(async res => {
                                        if (res !== null) {
                                            GetFriends(res)
                                                .then(async res => {
                                                    if (res.status === 200) {
                                                        const friends: User[] = await res.json();
                                                        setFriends(friends)
                                                    }
                                                })
                                        }
                                    })
                            }
                        })
                }
            })
    }, []);

    return (
        <View className="bg-white h-full relative">
            <View className="w-full h-[10%] flex-row mt-4 pr-4" >
                <Pressable className="ml-auto mt-auto mb-auto"><AntDesign name="search1" size={24} color="gray" /></Pressable>
                <TouchableHighlight underlayColor="rgb(226, 232, 240)" className="ml-6 mt-auto mb-auto w-[40px] h-[40px] rounded-full flex-row justify-center" onPress={() => navigation.navigate("AddFriendScreen")}>
                    <View className="m-auto">
                        <AntDesign name="adduser" size={24} color="gray" />
                    </View>
                </TouchableHighlight>
            </View>
            <View className="bg-slate-300 h-[2px] w-full mb-[2%]" />
            {friends.length === 0 ? <WelcomeScreen /> : <FriendsList friends={friends} />}
            <TouchableOpacity onPress={() => {
                navigation.navigate("AddExpenseScreen")
            }} className="absolute bottom-5 right-5 h-12 w-36 bg-[#5BC5A7] flex-row justify-center rounded-full shadow-lg shadow-black">
                <Text className="text-base font-semibold text-white mt-auto mb-auto">Add Expense</Text>
            </TouchableOpacity>
        </View>
    )
}