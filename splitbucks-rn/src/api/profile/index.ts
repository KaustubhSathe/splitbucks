import { API_DOMAIN } from '@env'
import { Group, User } from '../../types/types';
import { RetryHelper } from '../helper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function Authenticate(): Promise<User> {
    let user: User = JSON.parse(await AsyncStorage.getItem('user'))
    if (user !== null) {
        return user
    }
    user = await RetryHelper<User>(`${API_DOMAIN}/api/login`, {
        method: "POST",
    })
    if (user) {
        await AsyncStorage.setItem('user', JSON.stringify(user));
    }
    return user
}

export async function UpdateEmailSettings(
    notifyOnAddToGroup: boolean,
    notifyOnAddAsFriend: boolean,
    notifyOnExpenseAdded: boolean,
    notifyOnExpenseEdited: boolean,
    notifyOnComment: boolean,
    notifyWhenSomeonePays: boolean
): Promise<User> {
    return await RetryHelper<User>(`${API_DOMAIN}/api/email_settings`, {
        method: "POST",
        body: JSON.stringify({
            NotifyOnAddToGroup: notifyOnAddToGroup,
            NotifyOnAddAsFriend: notifyOnAddAsFriend,
            NotifyOnExpenseAdded: notifyOnExpenseAdded,
            NotifyOnExpenseEdited: notifyOnExpenseEdited,
            NotifyOnComment: notifyOnComment,
            NotifyWhenSomeonePays: notifyWhenSomeonePays,
        })
    })
}

export async function UpdatePushNotificationSettings(
    pushNotifyExpenseAdded: boolean,
    pushNotifyCommentAdded: boolean,
    pushNotifyExpenseUpdated: boolean,
    pushNotifyAddedAsFriend: boolean,
    pushNotifyFriendUpdated: boolean,
    pushNotifyAddedToGroup: boolean,
    pushNotifyGroupUpdated: boolean,
    pushNotifyRemovedFromGroup: boolean,
): Promise<User> {
    return await RetryHelper<User>(`${API_DOMAIN}/api/push_notification_settings`, {
        method: "POST",
        body: JSON.stringify({
            PushNotifyExpenseAdded: pushNotifyExpenseAdded,
            PushNotifyCommentAdded: pushNotifyCommentAdded,
            PushNotifyExpenseUpdated: pushNotifyExpenseUpdated,
            PushNotifyAddedAsFriend: pushNotifyAddedAsFriend,
            PushNotifyFriendUpdated: pushNotifyFriendUpdated,
            PushNotifyAddedToGroup: pushNotifyAddedToGroup,
            PushNotifyGroupUpdated: pushNotifyGroupUpdated,
            PushNotifyRemovedFromGroup: pushNotifyRemovedFromGroup,
        })
    })
}