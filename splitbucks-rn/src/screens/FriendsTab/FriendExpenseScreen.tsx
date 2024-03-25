import { useRoute } from "@react-navigation/native";
import { Image, Text, View } from "react-native";
import { FriendExpenseScreenProps } from "../../types/types";
import React from "react";

export function FriendExpenseScreen() {
    const route = useRoute<FriendExpenseScreenProps['route']>();

    return (
        <View className="bg-white h-full">
            <View className="w-full h-[10%] flex-row mt-4 pr-4">
            </View>
            <View className="relative">
                <View className="bg-slate-300 h-[2px] w-full mb-[2%]" />
                <Image
                    className="absolute left-10 top-[-20]"
                    source={{ uri: route.params?.friend.Picture }}
                    width={60} height={60}
                    borderRadius={100}
                />
            </View>
            <Text className="mt-10 ml-7 text-xl font-normal">{route.params?.friend.Name}</Text>


        </View>
    )
}