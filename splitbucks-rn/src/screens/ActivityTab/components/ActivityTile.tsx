import { Text, TouchableOpacity, View } from "react-native";
import { Activity, ActivityType, RootParamList } from "../../../types/types";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { GetUserGroups } from "../../../api/group";
import { useCallback } from "react";
import { GetGroupExpenses } from "../../../api/expense";
import { Authenticate } from "../../../api/profile";

export function ActivityTile({ activity }: { activity: Activity }) {
    let element: React.ReactElement;
    const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
    const redirectToGroup = useCallback(async () => {
        const group = (await GetUserGroups()).filter(grp => grp.PK === activity.PK)[0]
        navigation.navigate("GroupExpenseScreen", {
            group: group
        })
    }, [activity, navigation])

    const redirectToExpense = useCallback(async () => {
        const expense = (await GetGroupExpenses(activity.GroupID, activity.GroupType)).filter(ex => ex.SK === activity.ExpenseID)[0]
        const user = await Authenticate()
        navigation.navigate("ExpenseScreen", {
            expense: expense,
            user: user
        })
    }, [navigation, activity])


    switch (activity.ActivityType) {
        case ActivityType.GROUP_CREATED: {
            element = <TouchableOpacity className="p-2" onPress={redirectToGroup}>
                <Text className="text-base">
                    <Text className="font-semibold">{activity.CreatedByName}</Text> created the group <Text className="font-semibold">{activity.GroupName}</Text>
                </Text>
                <Text>{new Date(activity.CreatedAt).toLocaleString()}</Text>
            </TouchableOpacity>
            break;
        }
        case ActivityType.GROUP_EDITED: {
            element = <TouchableOpacity className="p-2" onPress={redirectToGroup}>
                <Text className="text-base">
                    <Text className="font-semibold">{activity.EditedByName}</Text> updated <Text className="font-semibold">{activity.NewTitle}</Text> in <Text className="font-semibold">{activity.GroupName}</Text>
                </Text>
                <Text>{new Date(activity.CreatedAt).toLocaleString()}</Text>
            </TouchableOpacity>
            break;
        }
        case ActivityType.GROUP_DELETED: {
            element = <TouchableOpacity className="p-2">
                <Text>
                    <Text className="font-semibold">{activity.DeletedByName}</Text> deleted the group <Text className="font-semibold">{activity.GroupName}</Text>
                </Text>
                <Text>{new Date(activity.CreatedAt).toLocaleString()}</Text>
            </TouchableOpacity>
            break;
        }
        case ActivityType.MEMBER_ADDED: {
            element = <TouchableOpacity className="p-2" onPress={redirectToGroup}>
                <Text className="text-base"><Text className="font-semibold">{activity.AddedByName}</Text> added <Text className="font-semibold">{activity.AddedMemberName}</Text> to the group <Text className="font-semibold">{activity.GroupName}</Text></Text>
                <Text>{new Date(activity.CreatedAt).toLocaleString()}</Text>
            </TouchableOpacity>
            break;
        }
        case ActivityType.MEMBER_REMOVED: {
            element = <TouchableOpacity className="p-2">
                <Text className="text-base"><Text className="font-semibold">{activity.RemovedByName}</Text> removed <Text className="font-semibold">{activity.RemovedMemberName}</Text> from group <Text className="font-semibold">{activity.GroupName}</Text></Text>
                <Text>{new Date(activity.CreatedAt).toLocaleString()}</Text>
            </TouchableOpacity>
            break;
        }
        case ActivityType.MEMBER_LEFT: {
            element = <TouchableOpacity className="p-2">
                <Text className="text-base"><Text className="font-semibold">{activity.LeftMemberName}</Text> the group <Text className="font-semibold">{activity.GroupName}</Text></Text>
                <Text>{new Date(activity.CreatedAt).toLocaleString()}</Text>
            </TouchableOpacity>
            break;
        }
        case ActivityType.EXPENSE_ADDED: {
            element = <TouchableOpacity className="p-2" onPress={redirectToExpense}>
                <Text className="text-base"><Text className="font-semibold">{activity.AddedByName}</Text> added <Text className="font-semibold">{activity.ExpenseDescription}</Text> to <Text className="font-semibold">{activity.GroupName}</Text></Text>
                <Text>{new Date(activity.CreatedAt).toLocaleString()}</Text>
            </TouchableOpacity>
            break;
        }
        case ActivityType.EXPENSE_EDITED: {
            element = <TouchableOpacity className="p-2" onPress={redirectToExpense}>
                <Text className="text-base"><Text className="font-semibold">{activity.EditedByName}</Text> updated <Text className="font-semibold">{activity.CurrentTitle}</Text> in <Text className="font-semibold">{activity.GroupName}</Text></Text>
                <Text>{new Date(activity.CreatedAt).toLocaleString()}</Text>
            </TouchableOpacity>
            break;
        }
        case ActivityType.EXPENSE_DELETED: {
            element = <TouchableOpacity className="p-2">
                <Text className="text-base"><Text className="font-semibold">{activity.DeletedByName}</Text> deleted <Text className="font-semibold">{activity.ExpenseDescription}</Text> from <Text className="font-semibold">{activity.GroupName}</Text></Text>
                <Text>{new Date(activity.CreatedAt).toLocaleString()}</Text>
            </TouchableOpacity>
            break;
        }
    }
    return element
}