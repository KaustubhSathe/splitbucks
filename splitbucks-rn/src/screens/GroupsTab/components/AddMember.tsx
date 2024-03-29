import { Text, TouchableHighlight, TouchableNativeFeedbackComponent, TouchableOpacity, View } from "react-native";
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Group, RootParamList } from "../../../types/types";

export function AddMember({ group }: { group: Group }) {
    const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
   
    return <TouchableHighlight className="flex-row pl-4 pr-4 h-12" onPress={() => navigation.navigate("FriendListScreen", {
        groupPK: group.PK
    })} underlayColor="rgb(226, 232, 240)">
        <View className="mt-auto mb-auto flex-row justify-center">
            <AntDesign name="adduser" size={28} color="black" />
            <Text className="ml-4 mt-auto mb-auto text-base">Add member to group</Text>
        </View>
    </TouchableHighlight>
}