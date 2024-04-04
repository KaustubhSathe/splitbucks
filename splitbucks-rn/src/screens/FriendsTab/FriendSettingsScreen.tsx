import { useRoute } from "@react-navigation/native";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { FriendExpenseScreenProps, FriendSettingsScreenProps, Group } from "../../types/types";
import { useEffect, useState } from "react";
import { GetUserGroups } from "../../api/group";
import { Entypo } from '@expo/vector-icons';

export function FriendSettingsScreen() {
    const route = useRoute<FriendSettingsScreenProps['route']>();
    const friend = route.params.friend
    const [sharedGroups, setSharedGroups] = useState<Group[]>([]);

    useEffect(() => {
        GetUserGroups().then(groups => setSharedGroups(groups.filter(x => x.Members.includes(friend.PK))))
    }, [])

    return <View>
        <View className="border-b-[1px] border-black h-16 pl-4 pr-4 flex-row">
            <Image source={{ uri: friend.Picture }} width={40} height={40} borderRadius={50} className="mt-auto mb-auto" />
            <View className="ml-4 flex-col mt-auto mb-auto">
                <Text className="text-base font-semibold">{friend.Name}</Text>
                <Text className="text-slate-500">{friend.Email}</Text>
            </View>
        </View>
        <View className="p-4">
            <Text className="text-base font-semibold">Shared groups</Text>
            <ScrollView>
                {sharedGroups.map((x, i) => <Text key={x.SK} className="text-base">{i + 1}. {x.GroupName}</Text>)}
            </ScrollView>
            <Text className="text-base font-semibold">Manage relationship</Text>
            <TouchableOpacity className="flex-row p-2">
                <Entypo name="remove-user" size={24} color="black" style={{ marginTop: 'auto', marginBottom: 'auto' }} />
                <View className="flex-col ml-4">
                    <Text className="text-red-500 text-base">Remove from friends list</Text>
                    <Text className="text-slate-500">Remove this user from your friends list.</Text>
                </View>
            </TouchableOpacity>
        </View>
    </View>
}