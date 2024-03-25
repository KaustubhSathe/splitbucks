import React from "react";
import { Text, View } from "react-native";
import { AddFriendButton } from "./AddFriendButton";
import { MaterialIcons } from '@expo/vector-icons';
import { useSelector } from "react-redux";
import { RootState } from "../../../lib/redux/store";

export function WelcomeScreen() {
    const user = useSelector((state: RootState) => state.user.value)
    return (
        <View className="p-2">
            <Text className="ml-auto mr-auto text-lg font-semibold  block text-black">Welcome to Splitbucks, {user.Name}!</Text>
            <MaterialIcons name="person-add-alt-1" size={200} style={{
                marginLeft: "auto",
                marginRight: "auto",
                marginTop: "15%"
            }} color="#5BC5A7" />
            <Text className="ml-auto mr-auto text-center mt-[2%] text-base mb-[5%] text-gray-500 pl-2 pr-2">As you use Splitbucks, friends and group mates will show here.</Text>
            <AddFriendButton />
        </View>
    )
}