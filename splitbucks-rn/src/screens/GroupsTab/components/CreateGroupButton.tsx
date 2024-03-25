import React from "react";
import { Pressable, Text, TouchableHighlight } from "react-native";
import { MaterialIcons, FontAwesome, AntDesign } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootParamList } from "../../../types/types";


export function CreateGroupButton() {
    const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();

    return (
        <TouchableHighlight underlayColor="#a9ccc2" onPress={() => navigation.navigate("CreateGroupScreen")} className="bg-white rounded-md mb-6 w-[60%] mt-4 ml-auto mr-auto h-10 flex flex-row justify-center border-[1.5px] border-[#5BC5A7]">
            <>
                <MaterialIcons name="group-add" size={24} color="#5BC5A7" style={{
                    marginBottom: "auto",
                    marginTop: "auto"
                }} />
                <Text className="ml-3 mt-auto mb-auto text-[#5BC5A7] font-semibold text-base">Start a new group</Text>
            </>
        </TouchableHighlight>
    )
}