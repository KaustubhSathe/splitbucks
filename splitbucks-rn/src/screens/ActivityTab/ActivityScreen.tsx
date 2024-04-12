import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RefreshControl, ScrollView } from "react-native";
import { RootParamList, Activity } from "../../types/types";
import { useCallback, useEffect, useState } from "react";
import { GetUserGroups } from "../../api/group";
import { GetActivities } from "../../api/activity";
import { ActivityTile } from "./components/ActivityTile";

const ActivityStack = createNativeStackNavigator<RootParamList>()

function ActivityScreen() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

    useEffect(() => {
        GetUserGroups().then(groups => {
            GetActivities(groups.map(x => x.PK))
                .then(activities => setActivities(activities.sort((a,b) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime())))
        })
    }, [refreshing])

    return (
        <ScrollView refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
            {activities?.map(x => <ActivityTile key={x.SK} activity={x} />)}
        </ScrollView>
    )
}

export function ActivityStackScreen() {
    return (
        <ActivityStack.Navigator screenOptions={{
            headerShown: true,
            statusBarColor: 'red',
            title: "Activity",
        }}>
            <ActivityStack.Screen name="ActivityScreen" component={ActivityScreen} />
        </ActivityStack.Navigator>
    )
}