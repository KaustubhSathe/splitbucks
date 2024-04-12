import { API_DOMAIN } from "@env";
import { User } from "../../types/types";
import { RetryHelper } from "../helper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ACTIVITIES } from "../activity";

const FRIENDS = 'friends'

export async function GetFriends(): Promise<User[]> {
    let friends: User[] = JSON.parse(await AsyncStorage.getItem(FRIENDS));
    if (friends === null) {
        friends = await RetryHelper<User[]>(`${API_DOMAIN}/api/friend`, {
            method: "GET",
        })
        if (friends) {
            await AsyncStorage.setItem(FRIENDS, JSON.stringify(friends))
        }
    }
    return friends
}


export async function AddFriend(email: string, name: string) {
    const friend = await RetryHelper<User>(`${API_DOMAIN}/api/friend`, {
        method: "POST",
        body: JSON.stringify({
            "EmailID": email,
            "PetName": name
        })
    })
    await AsyncStorage.removeItem(FRIENDS)
    await AsyncStorage.removeItem(ACTIVITIES)
    return friend
}