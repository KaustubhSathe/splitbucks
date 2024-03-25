import { API_DOMAIN } from '@env'

export async function Authenticate(splitbucks_id_token: string) {
    const response = await fetch(`${API_DOMAIN}/api/login`, {
        method: "POST",
        headers: {
            "splitbucks_id_token": splitbucks_id_token
        }
    })

    return response;
}

export async function UpdateEmailSettings(splitbucks_id_token: string, notifyOnAddToGroup: boolean, notifyOnAddAsFriend: boolean, notifyOnExpenseAdded: boolean, notifyOnExpenseEdited: boolean, notifyOnComment: boolean, notifyWhenSomeonePays: boolean) {
    const response = await fetch(`${API_DOMAIN}/api/email_settings`, {
        method: "POST",
        headers: {
            "splitbucks_id_token": splitbucks_id_token
        },
        body: JSON.stringify({
            NotifyOnAddToGroup: notifyOnAddToGroup,
	        NotifyOnAddAsFriend:   notifyOnAddAsFriend,
	        NotifyOnExpenseAdded: notifyOnExpenseAdded,
	        NotifyOnExpenseEdited: notifyOnExpenseEdited,
	        NotifyOnComment:       notifyOnComment,
	        NotifyWhenSomeonePays: notifyWhenSomeonePays,
        })
    })

    return response;
}

export async function UpdatePushNotificationSettings(
    splitbucks_id_token: string, 
    pushNotifyExpenseAdded: boolean,
    pushNotifyCommentAdded: boolean,
    pushNotifyExpenseUpdated: boolean,
    pushNotifyAddedAsFriend: boolean,
    pushNotifyFriendUpdated: boolean,
    pushNotifyAddedToGroup: boolean,
    pushNotifyGroupUpdated: boolean,
    pushNotifyRemovedFromGroup: boolean,
) {
    const response = await fetch(`${API_DOMAIN}/api/push_notification_settings`, {
        method: "POST",
        headers: {
            "splitbucks_id_token": splitbucks_id_token
        },
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

    return response;
}