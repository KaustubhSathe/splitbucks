import React from "react"
import { AccountStackScreen } from "../AccountTab/AccountStackScreen"
import { ActivityStackScreen } from "../ActivityTab/ActivityScreen"
import { FriendsStackScreen } from "../FriendsTab/FriendsStackScreen"
import { GroupStackScreen } from "../GroupsTab/GroupsStackScreen"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { RootParamList } from "../../types/types"
import { FontAwesome } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { useSelector } from "react-redux"
import { RootState } from "../../lib/redux/store"
import { Image } from "react-native"

const Tab = createBottomTabNavigator<RootParamList>();

export function AppScreen() {
    const user = useSelector((state: RootState) => state.user.value)

    return (
        <Tab.Navigator screenOptions={{
            headerShown: false,
        }}>
            <Tab.Screen name="GroupsTab" component={GroupStackScreen} options={{
                title: "Groups",
                tabBarIcon: ({ focused, color, size }) => { return <FontAwesome name="group" size={size} color={color} /> },
                tabBarActiveTintColor: '#5BC5A7',
                tabBarInactiveTintColor: 'gray'
            }} />
            <Tab.Screen name="FriendsTab" component={FriendsStackScreen} options={{
                title: "Friends",
                tabBarIcon: ({ focused, color, size }) => { return <MaterialCommunityIcons name="account" size={size} color={color} /> },
                tabBarActiveTintColor: '#5BC5A7',
                tabBarInactiveTintColor: 'gray'
            }} />
            <Tab.Screen name="ActivityTab" component={ActivityStackScreen} options={{
                title: "Activity",
                tabBarIcon: ({ focused, color, size }) => { return <FontAwesome name="database" size={size} color={color} /> },
                tabBarActiveTintColor: '#5BC5A7',
                tabBarInactiveTintColor: 'gray'
            }} />
            <Tab.Screen name="AccountTab" component={AccountStackScreen} options={{
                title: "Account",
                tabBarIcon: ({ focused, color, size }) => { return <Image source={{ uri: user.Picture }} width={size} height={size} style={{ borderRadius: 100 }} /> },
                tabBarActiveTintColor: '#5BC5A7',
                tabBarInactiveTintColor: 'gray'
            }} />
        </Tab.Navigator>
    )
}