import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Text, TouchableHighlight } from "react-native";
import { Group, RootParamList } from "../../../types/types";

export function GroupTile({ group }: { group: Group }) {
    const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();

    return (
        <TouchableHighlight underlayColor="rgb(226, 232, 240)" onPress={() => {
            navigation.navigate("GroupExpenseScreen", {
                group: group,
            })
        }} className="bg-sl w-ful flex-row p-2">
            <Text className="ml-4 mt-auto mb-auto text-lg font-semibold">{group.GroupName}</Text>
        </TouchableHighlight>
    )
}