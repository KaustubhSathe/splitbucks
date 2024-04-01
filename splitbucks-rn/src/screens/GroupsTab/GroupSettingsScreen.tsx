import { useEffect, useState } from "react";
import { Text, TextInput, View } from "react-native";
import { GroupExpenseScreenProps, User } from "../../types/types";
import { GetMembers } from "../../api/group";
import { useIsFocused, useRoute } from "@react-navigation/native";
import { AddMember } from "./components/AddMember";
import { MemberTile } from "./components/MemberTile";


export function GroupSettingsScreen() {
    const [members, setMembers] = useState<User[]>([]);
    const route = useRoute<GroupExpenseScreenProps['route']>();
    const group = route.params?.group;
    const [groupName, setGroupName] = useState<string>(group?.GroupName as string);
    const isFocused = useIsFocused()

    useEffect(() => {
        if (isFocused) {
            GetMembers(route.params?.group?.PK as string).then(members => setMembers(members))
        }
    }, [isFocused]);

    return <View>
        <View className="p-4 flex-row justify-start w-full">
            <Text className="text-lg font-semibold">Group Name:</Text>
            <TextInput value={groupName} className="ml-4 border-b-[1px] w-[60%]" />
        </View>
        <View className="bg-slate-300 h-[2px] w-full mb-[2%]" />
        <View className="pt-2">
            <Text className="ml-4 mb-2 text-base font-semibold text-slate-500">Group members</Text>
            <AddMember group={group} />
            {members?.map(x => <MemberTile key={x.PK} member={x} onPress={() => { }} secondText={x.Email} />)}
            <Text className="ml-4 mt-4 text-base font-semibold text-slate-500">Advanced Settings</Text>
        </View>
    </View>
}