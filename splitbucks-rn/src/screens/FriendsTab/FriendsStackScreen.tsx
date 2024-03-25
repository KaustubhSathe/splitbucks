import { RootParamList } from "../../types/types";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { FriendsScreen } from "./FriendsScreen";
import { AddFriendScreen } from "./AddFriendScreen";
import { FriendExpenseScreen } from "./FriendExpenseScreen";

const FriendsStack = createNativeStackNavigator<RootParamList>()

export function FriendsStackScreen() {
    return (
        <FriendsStack.Navigator initialRouteName="FriendsScreen" screenOptions={{
            headerShown: false,
            statusBarColor: 'red'
        }}>
            <FriendsStack.Screen name="FriendsScreen" component={FriendsScreen} />
            <FriendsStack.Screen name="AddFriendScreen" component={AddFriendScreen} options={{
                headerShown: true,
                headerTitle: "Add Friend"
            }} />
            <FriendsStack.Screen name="FriendExpenseScreen" component={FriendExpenseScreen} options={{
                headerShown: false,
            }} />
        </FriendsStack.Navigator>
    )
}