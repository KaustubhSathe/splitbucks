import { GestureResponderEvent, Image, Text, TouchableHighlight, TouchableOpacity, View } from "react-native";
import { User } from "../../../types/types";

export function MemberTile({ member, secondText, onPress }: { member: User, secondText: string, onPress: (event: GestureResponderEvent) => void }) {
    return (
        <TouchableHighlight className="flex-row pl-4 pr-4 h-16" onPress={onPress} underlayColor="rgb(226, 232, 240)">
            <View className="mt-auto mb-auto flex-row justify-center">
                <Image source={{
                    uri: member.Picture
                }} width={40} height={40} borderRadius={100} />
                <View>
                    <Text className="ml-4 mt-auto mb-auto text-base">{member.Name}</Text>
                    {secondText ? <Text className="ml-4 mt-auto mb-auto font-light text-sm text-slate-600">{secondText}</Text> : null}
                </View>
            </View>
        </TouchableHighlight>
    )
}