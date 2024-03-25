import { Button, Pressable, Text, View } from "react-native";
import CheckBox from '@react-native-community/checkbox';
import { useCallback, useState } from "react";
import { UpdateEmailSettings, UpdatePushNotificationSettings } from "../../api/profile";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../lib/redux/store";
import { setValue as setUser } from '../../lib/redux/userSlice'


export function PushNotificationSettingsScreen() {
    const dispatch = useDispatch()
    const user = useSelector((root: RootState) => root.user.value)
    const [pushNotifyAddedAsFriend, setPushNotifyAddedAsFriend] = useState<boolean>(user.PushNotifyAddedAsFriend);
    const [pushNotifyAddedToGroup, setPushNotifyAddedToGroup] = useState<boolean>(user.PushNotifyAddedToGroup);
    const [pushNotifyCommentAdded, setPushNotifyCommentAdded] = useState<boolean>(user.PushNotifyCommentAdded);
    const [pushNotifyExpenseAdded, setPushNotifyExpenseAdded] = useState<boolean>(user.PushNotifyExpenseAdded);
    const [pushNotifyExpenseUpdated, setPushNotifyExpenseUpdated] = useState<boolean>(user.PushNotifyExpenseUpdated);
    const [pushNotifyFriendUpdated, setPushNotifyFriendUpdated] = useState<boolean>(user.PushNotifyFriendUpdated);
    const [pushNotifyGroupUpdated, setPushNotifyGroupUpdated] = useState<boolean>(user.PushNotifyGroupUpdated);
    const [pushNotifyRemovedFromGroup, setPushNotifyRemovedFromGroup] = useState<boolean>(user.PushNotifyRemovedFromGroup);
    const [changesSaved, setChangesSaved] = useState<boolean>(false);


    const updatePushNotificationSettings = useCallback(async () => {
        const idToken = await AsyncStorage.getItem('idToken')
        if (idToken !== null) {
            const res = await UpdatePushNotificationSettings(
                idToken,
                pushNotifyExpenseAdded,
                pushNotifyCommentAdded,
                pushNotifyExpenseUpdated,
                pushNotifyAddedAsFriend,
                pushNotifyFriendUpdated,
                pushNotifyAddedToGroup,
                pushNotifyGroupUpdated,
                pushNotifyRemovedFromGroup,
            )
            if (res.status === 200) {
                dispatch(setUser({
                    ...user,
                    PushNotifyExpenseAdded: pushNotifyExpenseAdded,
                    PushNotifyCommentAdded: pushNotifyCommentAdded,
                    PushNotifyExpenseUpdated: pushNotifyExpenseUpdated,
                    PushNotifyAddedAsFriend: pushNotifyAddedAsFriend,
                    PushNotifyFriendUpdated: pushNotifyFriendUpdated,
                    PushNotifyAddedToGroup: pushNotifyAddedToGroup,
                    PushNotifyGroupUpdated: pushNotifyGroupUpdated,
                    PushNotifyRemovedFromGroup: pushNotifyRemovedFromGroup,
                }))
                setChangesSaved(true)
                setTimeout(() => {
                    setChangesSaved(false)
                }, 3000)
            }
        }
    }, [pushNotifyExpenseAdded, pushNotifyCommentAdded, pushNotifyExpenseUpdated, pushNotifyAddedAsFriend, pushNotifyFriendUpdated, pushNotifyAddedToGroup, pushNotifyGroupUpdated, pushNotifyRemovedFromGroup]);

    return (
        <View className="p-4">
            <Text className="text-slate-400 text-base font-semibold">EXPENSES</Text>
            <View className="flex-row justify-between">
                <Text className="mt-auto mb-auto">Expense added</Text>
                <CheckBox className="mt-auto mb-auto" disabled={false} value={pushNotifyExpenseAdded}
                    onValueChange={(newValue) => setPushNotifyExpenseAdded(newValue)} />
            </View>
            <View className="flex-row justify-between">
                <Text className="mt-auto mb-auto">Comment added</Text>
                <CheckBox className="mt-auto mb-auto" disabled={false} value={pushNotifyCommentAdded}
                    onValueChange={(newValue) => setPushNotifyCommentAdded(newValue)} />
            </View>
            <View className="flex-row justify-between">
                <Text className="mt-auto mb-auto">Expense updated/deleted</Text>
                <CheckBox className="mt-auto mb-auto" disabled={false} value={pushNotifyExpenseUpdated}
                    onValueChange={(newValue) => setPushNotifyExpenseUpdated(newValue)} />
            </View>
            <Text className="text-slate-400 text-base font-semibold">FRIENDS</Text>
            <View className="flex-row justify-between">
                <Text className="mt-auto mb-auto">Added as friend</Text>
                <CheckBox className="mt-auto mb-auto" disabled={false} value={pushNotifyAddedAsFriend}
                    onValueChange={(newValue) => setPushNotifyAddedAsFriend(newValue)} />
            </View>
            <View className="flex-row justify-between">
                <Text className="mt-auto mb-auto">Friend updated/deleted</Text>
                <CheckBox className="mt-auto mb-auto" disabled={false} value={pushNotifyFriendUpdated}
                    onValueChange={(newValue) => setPushNotifyFriendUpdated(newValue)} />
            </View>
            <Text className="text-slate-400 text-base font-semibold">GROUPS</Text>
            <View className="flex-row justify-between">
                <Text className="mt-auto mb-auto">Added to group</Text>
                <CheckBox className="mt-auto mb-auto" disabled={false} value={pushNotifyAddedToGroup}
                    onValueChange={(newValue) => setPushNotifyAddedToGroup(newValue)} />
            </View>
            <View className="flex-row justify-between">
                <Text className="mt-auto mb-auto">Group updated/deleted</Text>
                <CheckBox className="mt-auto mb-auto" disabled={false} value={pushNotifyGroupUpdated}
                    onValueChange={(newValue) => setPushNotifyGroupUpdated(newValue)} />
            </View>
            <View className="flex-row justify-between">
                <Text className="mt-auto mb-auto">Removed from group</Text>
                <CheckBox className="mt-auto mb-auto" disabled={false} value={pushNotifyRemovedFromGroup}
                    onValueChange={(newValue) => setPushNotifyRemovedFromGroup(newValue)} />
            </View>

            <Pressable className="mt-4 bg-orange-500 w-28 h-10 flex justify-center rounded-lg shadow-lg shadow-orange-700" onPress={updatePushNotificationSettings}>
                <Text className="text-base font-semibold text-white ml-auto mr-auto">Save changes</Text>
            </Pressable>
            {changesSaved && <Text className="mt-6 text-green-600 font-semibold text-lg">Changes saved successfully!!</Text>}
        </View>
    )
}