import { API_DOMAIN } from "@env";
import { Group, User } from "../../types/types";
import { RetryHelper } from "../helper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ACTIVITIES } from "../activity";

export const USER_GROUPS = 'user_groups'
const GROUP_MEMBERS = (group_id: string) => `group_members_${group_id}`

export async function CreateGroup(groupName: string): Promise<Group> {
    let group = await RetryHelper<Group>(`${API_DOMAIN}/api/group`, {
        method: "POST",
        body: JSON.stringify({
            GroupName: groupName
        })
    })
    await AsyncStorage.removeItem(USER_GROUPS)
    await AsyncStorage.removeItem(ACTIVITIES)
    return group
}

export async function GetUserGroups(): Promise<Group[]> {
    let groups: Group[] = JSON.parse(await AsyncStorage.getItem(USER_GROUPS));
    if (groups === null) {
        groups = await RetryHelper<Group[]>(`${API_DOMAIN}/api/user_groups`, {
            method: "GET",
        })
        if (groups) {
            await AsyncStorage.setItem(USER_GROUPS, JSON.stringify(groups))
        }
    }
    return groups
}

export async function GetMembers(group_id: string): Promise<User[]> {
    let users: User[] = JSON.parse(await AsyncStorage.getItem(GROUP_MEMBERS(group_id)));
    if (users === null) {
        users = await RetryHelper<User[]>(`${API_DOMAIN}/api/get_members?group_id=${encodeURIComponent(group_id)}`, {
            method: "GET",
        })
        if (users) {
            await AsyncStorage.setItem(GROUP_MEMBERS(group_id), JSON.stringify(users))
        }
    }
    return users
}


export async function AddMember(group_id: string, group_name: string, member_id: string, member_name: string): Promise<Group> {
    const group = await RetryHelper<Group>(`${API_DOMAIN}/api/add_member`, {
        method: "POST",
        body: JSON.stringify({
            MemberID: member_id,
            MemberName: member_name,
            GroupID: group_id,
            GroupName: group_name,
        })
    })
    await AsyncStorage.removeItem(USER_GROUPS)
    await AsyncStorage.removeItem(GROUP_MEMBERS(group_id))
    await AsyncStorage.removeItem(ACTIVITIES)
    return group
}