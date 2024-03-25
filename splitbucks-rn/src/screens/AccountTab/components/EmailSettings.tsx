import React from "react";
import { Text, TouchableHighlight, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootParamList } from "../../../types/types";

export function EmailSettings() {
    const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();

    return (
        <TouchableOpacity onPress={() => {
            navigation.navigate('EmailSettingsScreen')
        }} className="flex-row gap-4 mb-4">
            <MaterialIcons name="email" size={24} color="black" />
            <Text>Email Settings</Text>
        </TouchableOpacity>
    )
}