import React from "react";
import { Pressable, Text, TouchableHighlight, TouchableOpacity } from "react-native";
import { MaterialIcons, AntDesign } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootParamList } from "../../../types/types";

export function AddFriendButton() {
    const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();

    return (
        <TouchableHighlight underlayColor="#a9ccc2" onPress={() => navigation.navigate("AddFriendScreen")} className="mt-4 bg-white rounded-md w-[60%] ml-auto mr-auto h-10 flex flex-row justify-center border-[1.5px] border-[#5BC5A7]">
            <>
                <MaterialIcons name="group-add" size={24} color="#5BC5A7" style={{
                    marginBottom: "auto",
                    marginTop: "auto"
                }} />
                <Text className="ml-3 mt-auto mb-auto text-[#5bc5a7] font-semibold text-base">Add more friends</Text>
            </>
        </TouchableHighlight>
    )
}