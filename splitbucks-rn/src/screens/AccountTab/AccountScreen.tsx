import { Image, Linking, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { AccountScreenProps } from "../../types/types";
import { useSelector } from "react-redux";
import { RootState } from "../../lib/redux/store";
import { AntDesign } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { LogOut } from "./components/Logout";
import { EmailSettings } from "./components/EmailSettings";
import { PushNotificationSettingsScreen } from "./PushNotificationSettingsScreen";
import React from "react";
import { PushNotificationSettings } from "./components/PushNotificationSettings";

export function AccountScreen({ navigation }: AccountScreenProps) {
    const user = useSelector((root: RootState) => root.user.value)

    return (
        <ScrollView>
            <View className="p-4 gap-y-2">
                <Text className="font-normal text-2xl">Account</Text>
                <View className="flex-row justify-evenly">
                    <Image source={{
                        uri: user.Picture
                    }} width={90} height={90} borderRadius={100} />
                    <View className="flex-col justify-center">
                        <Text className="text-center w-full">{user.Name}</Text>
                        <Text className="">{user.Email}</Text>
                    </View>
                </View>
            </View>
            <View className="bg-slate-300 h-[2px] w-full mb-[2%]" />
            <View className="pl-4">
                <Text className="font-semibold text-slate-500 mb-4">Preferences</Text>
                <EmailSettings />
                <PushNotificationSettings />
                <View className="flex-row gap-4 mb-4">
                    <AntDesign name="lock1" size={24} color="black" />
                    <Text>Passcode</Text>
                </View>
                <Text className="font-semibold text-slate-500 mb-4">Feedback</Text>
                <View className="flex-row gap-4 mb-4">
                    <FontAwesome name="star" size={24} color="black" />
                    <Text>Rate Splitbucks</Text>
                </View>
                <TouchableOpacity className="flex-row gap-4 mb-4" onPress={() => {
                    Linking.openURL(`mailto:kaustubhsathe39443@gmail.com`)
                }}>
                    <MaterialIcons name="contact-support" size={24} color="black" />
                    <Text>Contact Splitbucks Support</Text>
                </TouchableOpacity>
            </View>
            <View className="bg-slate-300 h-[2px] w-full mb-[2%]" />
            <View className="pl-4 pt-4">
                <LogOut />
                <Text className="ml-auto mr-auto mb-4">Made with &#128151; in Bengaluru, India.</Text>
                <Text className="ml-auto mr-auto mb-4">Privacy Policy.</Text>
            </View>
        </ScrollView>
    )
}