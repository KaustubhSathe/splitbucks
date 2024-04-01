import { Text, TouchableOpacity, View } from "react-native";
import { Activity, ActivityType } from "../../../types/types";

export function ActivityTile({ activity }: { activity: Activity }) {
    let description: React.ReactElement;
    switch (activity.ActivityType) {
        case ActivityType.GROUP_CREATED: {
            description = <Text className="text-base">
                <Text className="font-semibold">{activity.CreatedByName}</Text> created the group <Text className="font-semibold">{activity.GroupName}</Text>
            </Text>
            break;
        }
        case ActivityType.GROUP_EDITED: {
            description = <Text className="text-base">
                <Text className="font-semibold">{activity.EditedByName}</Text> updated <Text className="font-semibold">{activity.NewTitle}</Text> in <Text className="font-semibold">{activity.GroupName}</Text></Text>
            break;
        }
        case ActivityType.GROUP_DELETED: {
            description = <Text><Text className="font-semibold">{activity.DeletedByName}</Text> deleted the group <Text className="font-semibold">{activity.GroupName}</Text></Text>
            break;
        }
        case ActivityType.MEMBER_ADDED: {
            description = <Text className="text-base"><Text className="font-semibold">{activity.AddedByName}</Text> added <Text className="font-semibold">{activity.AddedMemberName}</Text> to the group <Text className="font-semibold">{activity.GroupName}</Text></Text>
            break;
        }
        case ActivityType.MEMBER_REMOVED: {
            description = <Text className="text-base"><Text className="font-semibold">{activity.RemovedByName}</Text> removed <Text className="font-semibold">{activity.RemovedMemberName}</Text> from group <Text className="font-semibold">{activity.GroupName}</Text></Text>
            break;
        }
        case ActivityType.MEMBER_LEFT: {
            description = <Text className="text-base"><Text className="font-semibold">{activity.LeftMemberName}</Text> the group <Text className="font-semibold">{activity.GroupName}</Text></Text>
            break;
        }
        case ActivityType.EXPENSE_ADDED: {
            description = <Text className="text-base"><Text className="font-semibold">{activity.AddedByName}</Text> added <Text className="font-semibold">{activity.ExpenseDescription}</Text> to <Text className="font-semibold">{activity.GroupName}</Text></Text>
            break;
        }
        case ActivityType.EXPENSE_EDITED: {
            description = <Text className="text-base"><Text className="font-semibold">{activity.EditedByName}</Text> updated <Text className="font-semibold">{activity.CurrentTitle}</Text> in <Text className="font-semibold">{activity.GroupName}</Text></Text>
            break;
        }
        case ActivityType.EXPENSE_DELETED: {
            description = <Text className="text-base"><Text className="font-semibold">{activity.DeletedByName}</Text> deleted <Text className="font-semibold">{activity.ExpenseDescription}</Text> from <Text className="font-semibold">{activity.GroupName}</Text></Text>
            break;
        }
    }
    return <TouchableOpacity className="p-2">
        {description}
        <Text>{new Date(activity.CreatedAt).toLocaleString()}</Text>
    </TouchableOpacity>
}