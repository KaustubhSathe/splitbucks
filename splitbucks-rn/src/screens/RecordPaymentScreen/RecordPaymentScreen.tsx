import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { RecordPaymentScreenProps, RootParamList, Split } from "../../types/types";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { AddExpense } from "../../api/expense";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export function RecordPaymentScreen() {
    const route = useRoute<RecordPaymentScreenProps['route']>();
    const member = route.params.member
    const user = route.params.user
    const group = route.params.group
    const [owedAmount, setOwedAmount] = useState<number>(route.params.owedAmount);
    const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();

    const settleUp = useCallback(async () => {
        const splitString = owedAmount >= 0.0 ? `${user.PK}:${member.PK}` : `${member.PK}:${user.PK}`
        const expense = await AddExpense(
            owedAmount >= 0.0 ? `${member.Name} paid ${user.Name}` : `${user.Name} paid ${member.Name}`,
            owedAmount,
            "Rs",
            owedAmount >= 0.0 ? member.PK : user.PK,
            owedAmount >= 0.0 ? member.Name : user.Name,
            "EQUAL",
            {
                [splitString]: owedAmount
            },
            new Date(),
            "settle up",
            [member.PK, user.PK],
            "GROUP",
            group.PK,
            group.GroupName,
            true,
        )
        navigation.navigate("GroupExpenseScreen", {
            group: group
        })
    }, [route, member, user, group, owedAmount]);

    return <View className="p-4 flex-col justify-center h-full w-full">
        {
            owedAmount >= 0 ? <Text className="ml-auto mr-auto">{member.Name} paid you in group {group.GroupName}</Text>
                : <Text className="ml-auto mr-auto">You paid {member.Name} in group {group.GroupName}</Text>
        }
        <View className="mt-4 flex-row ml-auto mr-auto">
            <Text className="text-base font-semibold">Amount: </Text>
            <TextInput className="border-b-[1px]  w-24" keyboardType="numeric" value={owedAmount.toString()}
                onChangeText={(text) => setOwedAmount(parseFloat(text.replace(/[^0-9]/g, '')))} />
        </View>
        <TouchableOpacity onPress={settleUp} className="mt-4 ml-auto mr-auto w-20 h-10 bg-orange-500 flex justify-center rounded-lg shadow-black shadow-lg">
            <Text className="ml-auto mr-auto text-white font-semibold">Settle Up</Text>
        </TouchableOpacity>
    </View>
}