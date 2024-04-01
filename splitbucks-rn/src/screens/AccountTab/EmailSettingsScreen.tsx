import { Button, Pressable, Text, TouchableOpacity, View } from "react-native";
import CheckBox from '@react-native-community/checkbox';
import { useCallback, useState } from "react";
import { UpdateEmailSettings } from "../../api/profile";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../lib/redux/store";
import { setValue as setUser } from '../../lib/redux/userSlice'
import { User } from "../../types/types";


export function EmailSettingsScreen() {
    const dispatch = useDispatch()
    const user = useSelector((root: RootState) => root.user.value)
    const [notifyOnAddToGroup, setNotifyOnAddToGroup] = useState<boolean>(user.NotifyOnAddToGroup);
    const [notifyOnAddAsFriend, setNotifyOnAddAsFriend] = useState<boolean>(user.NotifyOnAddAsFriend);
    const [notifyOnExpenseAdded, setNotifyOnExpenseAdded] = useState<boolean>(user.NotifyOnExpenseAdded);
    const [notifyOnExpenseEdited, setNotifyOnExpenseEdited] = useState<boolean>(user.NotifyOnExpenseEdited);
    const [notifyOnComment, setNotifyOnComment] = useState<boolean>(user.NotifyOnComment);
    const [notifyWhenSomeonePays, setNotifyWhenSomeonePays] = useState<boolean>(user.NotifyWhenSomeonePays);
    const [changesSaved, setChangesSaved] = useState<boolean>(false);

    const updateEmailSettings = useCallback(async () => {
        await UpdateEmailSettings(
            notifyOnAddToGroup,
            notifyOnAddAsFriend,
            notifyOnExpenseAdded,
            notifyOnExpenseEdited,
            notifyOnComment,
            notifyWhenSomeonePays
        )
        dispatch(setUser({
            ...user,
            NotifyOnAddAsFriend: notifyOnAddAsFriend,
            NotifyOnAddToGroup: notifyOnAddToGroup,
            NotifyOnComment: notifyOnComment,
            NotifyOnExpenseAdded: notifyOnExpenseAdded,
            NotifyOnExpenseEdited: notifyOnExpenseEdited,
            NotifyWhenSomeonePays: notifyWhenSomeonePays
        }))
        setChangesSaved(true)
        setTimeout(() => {
            setChangesSaved(false)
        }, 3000)
    }, [notifyOnAddToGroup, notifyOnAddAsFriend, notifyOnExpenseAdded, notifyOnExpenseEdited, notifyOnComment, notifyWhenSomeonePays, user]);

    return (
        <View className="p-4">
            <Text className="text-slate-400 text-base font-semibold">GROUPS AND FRIENDS</Text>
            <View className="flex-row justify-between">
                <Text className="mt-auto mb-auto">When someone adds me to a group</Text>
                <CheckBox className="mt-auto mb-auto" disabled={false} value={notifyOnAddToGroup}
                    onValueChange={(newValue) => setNotifyOnAddToGroup(newValue)} />
            </View>
            <View className="flex-row justify-between">
                <Text className="mt-auto mb-auto">When someone adds me as a friend</Text>
                <CheckBox className="mt-auto mb-auto" disabled={false} value={notifyOnAddAsFriend}
                    onValueChange={(newValue) => setNotifyOnAddAsFriend(newValue)} />
            </View>
            <Text className="text-slate-400 text-base font-semibold">EXPENSES</Text>
            <View className="flex-row justify-between">
                <Text className="mt-auto mb-auto">When an expense is added</Text>
                <CheckBox className="mt-auto mb-auto" disabled={false} value={notifyOnExpenseAdded}
                    onValueChange={(newValue) => setNotifyOnExpenseAdded(newValue)} />
            </View>
            <View className="flex-row justify-between">
                <Text className="mt-auto mb-auto">When an expense is edited/deleted</Text>
                <CheckBox className="mt-auto mb-auto" disabled={false} value={notifyOnExpenseEdited}
                    onValueChange={(newValue) => setNotifyOnExpenseEdited(newValue)} />
            </View>
            <View className="flex-row justify-between">
                <Text className="mt-auto mb-auto">When someone comments on an expense</Text>
                <CheckBox className="mt-auto mb-auto" disabled={false} value={notifyOnComment}
                    onValueChange={(newValue) => setNotifyOnComment(newValue)} />
            </View>
            <View className="flex-row justify-between">
                <Text className="mt-auto mb-auto">When someone pays me</Text>
                <CheckBox className="mt-auto mb-auto" disabled={false} value={notifyWhenSomeonePays}
                    onValueChange={(newValue) => setNotifyWhenSomeonePays(newValue)} />
            </View>

            <TouchableOpacity className="mt-4 bg-orange-500 w-28 h-10 flex justify-center rounded-lg shadow-lg shadow-orange-700" onPress={updateEmailSettings}>
                <Text className="text-base font-semibold text-white ml-auto mr-auto">Save changes</Text>
            </TouchableOpacity>
            {changesSaved && <Text className="mt-6 text-green-600 font-semibold text-lg">Changes saved successfully!!</Text>}
        </View>
    )
}