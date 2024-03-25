import React from "react";
import { Text, View } from "react-native";
import { CreateGroupButton } from "./CreateGroupButton";
import { FontAwesome } from '@expo/vector-icons';
import { useSelector } from "react-redux";
import { RootState } from "../../../lib/redux/store";

export function WelcomeScreen() {
    const user = useSelector((state: RootState) => state.user.value)

    return (
        <View className="p-2">
            <Text className="ml-auto mr-auto text-lg font-semibold  block text-black">Welcome to Splitbucks, {user.Name}!</Text>
            <FontAwesome name="group" size={200} style={{
                marginLeft: "auto",
                marginRight: "auto",
                marginTop: "15%"
            }} color="#5BC5A7" />
            <Text className="ml-auto mr-auto text-center mt-[10%] text-base mb-[5%] text-gray-500 pl-2 pr-2">Splitbucks groups you create or are added to will show here.</Text>
            <CreateGroupButton />
        </View>
    )
}