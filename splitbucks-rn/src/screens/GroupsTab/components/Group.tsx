import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Text, TouchableHighlight } from "react-native";
import { Group, RootParamList, User } from "../../../types/types";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function GroupTile({ group }: { group: Group }) {
    const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
    const [owedAmount, setOwedAmount] = useState<number>(0.0);
    useEffect(() => {
        AsyncStorage.getItem('user')
            .then(res => {
                if (res !== null) {
                    const user: User = JSON.parse(res)
                    // Owed amount calculation
                    let owedAmount = 0.0;
                    if (group.Owes) {
                        group.Members.forEach(member => {
                            owedAmount += group.Owes[`${member}:${user.PK}`] - group.Owes[`${user.PK}:${member}`]
                        })
                        setOwedAmount(owedAmount)
                    }
                }
            })
    }, [])



    return (
        <TouchableHighlight underlayColor="rgb(226, 232, 240)" onPress={() => {
            navigation.navigate("GroupExpenseScreen", {
                group: group,
            })
        }} className="bg-sl w-ful flex-col p-2 h-16 border-[0.5px]">
            <>
                <Text className="ml-4 mt-auto mb-auto text-lg font-semibold">{group.GroupName}</Text>
                {owedAmount >= 0.0 ?
                    <Text className="ml-4 mt-auto mb-auto text-lg font-semibold text-green-500">You are owed: {owedAmount}</Text> :
                    <Text className="ml-4 mt-auto mb-auto text-lg font-semibold text-red-500">You are owed: {owedAmount}</Text>
                }
            </>
        </TouchableHighlight>
    )
}