import React from "react";
import { Pressable, TouchableHighlight, View } from "react-native";
import { AntDesign } from '@expo/vector-icons';

export function ExpenseScreen() {
    return <View className="bg-white h-full relative">
        <View className="w-full h-[10%] flex-row mt-4 pr-4" >
            <Pressable className="ml-auto mt-auto mb-auto"><AntDesign name="search1" size={24} color="gray" /></Pressable>
            <TouchableHighlight underlayColor="rgb(226, 232, 240)" className="ml-6 mt-auto mb-auto w-[40px] h-[40px] rounded-full flex-row justify-center" onPress={() => navigation.navigate("AddFriendScreen")}>
                <View className="m-auto">
                    <AntDesign name="adduser" size={24} color="gray" />
                </View>
            </TouchableHighlight>
        </View>
        <View className="bg-slate-300 h-[2px] w-full mb-[2%]" />
        
    </View>
}