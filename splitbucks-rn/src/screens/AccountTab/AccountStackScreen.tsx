import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootParamList } from "../../types/types";
import { EmailSettingsScreen } from "./EmailSettingsScreen";
import { AccountScreen } from "./AccountScreen";
import { PushNotificationSettingsScreen } from "./PushNotificationSettingsScreen";

const AccountStack = createNativeStackNavigator<RootParamList>()

export function AccountStackScreen() {
    return (
        <AccountStack.Navigator screenOptions={{
            headerShown: false,
            statusBarColor: 'red'
        }} initialRouteName="AccountScreen">
            <AccountStack.Screen name="AccountScreen" component={AccountScreen} />
            <AccountStack.Screen name="EmailSettingsScreen" component={EmailSettingsScreen} options={{
                headerTitle: "Email Settings",
                headerShown: true
            }} />
            <AccountStack.Screen name="PushNotificationSettingsScreen" component={PushNotificationSettingsScreen} options={{
                headerTitle: "Push Notification Settings",
                headerShown: true
            }} />
        </AccountStack.Navigator>
    )
}