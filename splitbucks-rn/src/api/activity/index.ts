import { API_DOMAIN } from "@env";
import { Activity } from "../../types/types";
import { RetryHelper } from "../helper";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const ACTIVITIES = 'activities'

export async function GetActivities(groupIDs: string[]) {
    let activities: Activity[]  = JSON.parse(await AsyncStorage.getItem(ACTIVITIES))
    if (activities) {
        return activities;
    }
    activities = await RetryHelper<Activity[]>(`${API_DOMAIN}/api/activities`, {
        method: "POST",
        body: JSON.stringify({
            GroupIDs: groupIDs,
        })
    })
    await AsyncStorage.setItem(ACTIVITIES, JSON.stringify(activities))
    return activities
}