import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text, View } from "react-native";
import { RootParamList, ActivityScreenProps } from "../../types/types";

const ActivityStack = createNativeStackNavigator<RootParamList>()

function ActivityScreen({ navigation }: ActivityScreenProps) {
    return (
        <View>
            <Text>ActivityScreen</Text>
        </View>
    )
}

export function ActivityStackScreen() {
    return (
        <ActivityStack.Navigator screenOptions={{
            headerShown: false,
            statusBarColor: 'red'
        }}>
            <ActivityStack.Screen name="ActivityScreen" component={ActivityScreen} />
        </ActivityStack.Navigator>
    )
}