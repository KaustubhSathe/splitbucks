import React from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootParamList } from "../../../types/types";

export function PushNotificationSettings() {
    const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
    
    return (
        <TouchableOpacity className="flex-row gap-4 mb-4" onPress={() => {
            navigation.navigate("PushNotificationSettingsScreen")
        }}>
            <FontAwesome name="bell-o" size={24} color="black" />
            <Text>Device and push notifications settings</Text>
        </TouchableOpacity>
    )
}