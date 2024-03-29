import React from "react";
import { Pressable, Text } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AccountScreenProps, RootParamList } from "../../../types/types";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";


export function LogOut() {
    const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
    return (
        <Pressable className="flex-row gap-4 mb-4" onPress={async () => {
            await AsyncStorage.clear()
            await GoogleSignin.signOut();
            navigation.reset({
                index: 0,
                routes: [{ name: "LogInScreen"}],
            })
        }}>
            <MaterialIcons name="logout" size={24} color="black" />
            <Text>Logout</Text>
        </Pressable>
    )
}