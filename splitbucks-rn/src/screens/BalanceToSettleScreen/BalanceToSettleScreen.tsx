import { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { GetFriends } from "../../api/friend";
import { useRoute, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BalanceToSettleScreenProps, Group, RootParamList, User } from "../../types/types";



export function BalanceToSettleScreen() {
    const route = useRoute<BalanceToSettleScreenProps['route']>();
    const group = route.params.group
    const user = route.params.user
    const [members, setMembers] = useState<User[]>([]);

    useEffect(() => {
        GetFriends().then(friends => {
            setMembers(friends.filter(fr => group.Members.includes(fr.PK)))
        })
    }, [])

    return <View className="p-4">
        {members.map(mm => <SettleUpTile key={mm.PK} member={mm} user={user} group={group} />)}
    </View>
}

function SettleUpTile({ member, user, group }: { member: User, user: User, group: Group }) {
    const owedAmount = (group?.Owes[`${member?.PK}:${user?.PK}`] ?? 0) - (group?.Owes[`${user?.PK}:${member?.PK}`] ?? 0)
    const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();

    return <TouchableOpacity className="p-2 flex-row" onPress={() => {
        if (owedAmount !== 0.0) {
            navigation.navigate("RecordPaymentScreen", {
                member: member,
                owedAmount: owedAmount,
                user: user,
                group: group
            })
        }
    }}>
        <Image source={{ uri: member.Picture }} width={50} height={50} borderRadius={100} />
        <Text className="mt-auto mb-auto ml-4">{member.Name}</Text>
        {owedAmount >= 0.0 ? <Text className="ml-auto mt-auto mb-auto text-green-500">You are owed {owedAmount}</Text> : <Text className="ml-auto mt-auto mb-auto text-red-500">You owe {owedAmount}</Text>}
    </TouchableOpacity>
}