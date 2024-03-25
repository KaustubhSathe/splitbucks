import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { RouteProp } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

export type RootParamList = {
    GroupDashboardScreen: undefined;
    GroupScreen: undefined;
    CreateGroupScreen: undefined;
    AddExpenseScreen: undefined;
    FriendsScreen: undefined;
    AddFriendScreen: undefined;
    FriendExpenseScreen: {
        friend: User;
    } | undefined;
    GroupExpenseScreen: {
        group: Group;
    } | undefined;
    ActivityScreen: undefined;
    AccountScreen: undefined;
    GroupsTab: undefined;
    FriendsTab: undefined;
    ActivityTab: undefined;
    AccountTab: undefined;
    LogInScreen: undefined;
    EmailSettingsScreen: undefined;
    PushNotificationSettingsScreen: undefined;
    AppScreen: undefined;
}

export type GroupDashboardProps = BottomTabScreenProps<RootParamList, 'GroupDashboardScreen'>
export type GroupScreenProps = BottomTabScreenProps<RootParamList, 'GroupScreen'>
export type CreateGroupScreenProps = BottomTabScreenProps<RootParamList, 'CreateGroupScreen'>
export type FriendsScreenProps = BottomTabScreenProps<RootParamList, 'FriendsScreen'>
export type ActivityScreenProps = BottomTabScreenProps<RootParamList, 'ActivityScreen'>
export type AccountScreenProps = BottomTabScreenProps<RootParamList, 'AccountScreen'>
export type LoginScreenProps = BottomTabScreenProps<RootParamList, 'LogInScreen'>
export type FriendExpenseScreenProps = NativeStackScreenProps<RootParamList, "FriendExpenseScreen">;
export type GroupExpenseScreenProps = NativeStackScreenProps<RootParamList, "GroupExpenseScreen">;

export type User = {
    PK: string
    SK: string
    CreatedAt: Date
    UpdatedAt: Date
    DeletedAt: Date
    Email: string
    Name: string
    Picture: string
    GivenName: string
    FamilyName: string
    NotifyOnAddToGroup: boolean,
    NotifyOnAddAsFriend: boolean,
    NotifyOnExpenseAdded: boolean,
    NotifyOnExpenseEdited: boolean,
    NotifyOnComment: boolean,
    NotifyWhenSomeonePays: boolean,
    PushNotifyExpenseAdded: boolean,
    PushNotifyCommentAdded: boolean,
    PushNotifyExpenseUpdated: boolean,
    PushNotifyAddedAsFriend: boolean,
    PushNotifyFriendUpdated: boolean,
    PushNotifyAddedToGroup: boolean,
    PushNotifyGroupUpdated: boolean,
    PushNotifyRemovedFromGroup: boolean,
}

export type Group = {
    PK: string
    SK: string
    CreatedAt: Date
    UpdatedAt: Date
    DeletedAt: Date
    GroupName: string
    Admin: string
    Members: string[]
}