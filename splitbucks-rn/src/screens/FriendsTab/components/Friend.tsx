import { Image, Text, TouchableHighlight, TouchableOpacity, View } from "react-native";
import { RootParamList, User } from "../../../types/types";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export function Friend({ friend }: { friend: User }) {
    const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();

    return (
        <TouchableHighlight underlayColor="rgb(226, 232, 240)" onPress={() => {
            navigation.navigate("FriendExpenseScreen", {
                friend: friend,
            })
        }} className="bg-sl w-ful flex-row p-2">
            <>
                <Image source={{
                    uri: friend.Picture
                }} width={50} height={50} borderRadius={100} />
                <Text className="ml-4 mt-auto mb-auto text-lg font-semibold">{friend.Name}</Text>
            </>
        </TouchableHighlight>
    )
}