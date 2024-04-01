import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { RouteProp } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

export type RootParamList = {
    GroupDashboardScreen: undefined;
    GroupScreen: undefined;
    CreateGroupScreen: undefined;
    GroupSettingsScreen: {
        group: Group | undefined;
    } | undefined;
    AddExpenseScreen: undefined;
    WhoPaidScreen: {
        groupPK: string | undefined;
        selectedMembers: User[] | undefined;
        expensePaidBy: User | undefined;
        setExpensePaidBy: React.Dispatch<React.SetStateAction<User>> | undefined;
    } | undefined;
    AdjustSplitScreen: {
        groupPK: string | undefined;
        selectedMembers: User[] | undefined;
        totalAmount: number;
        expensePaidBy: User;
        expenseSplit: Split;
        setExpenseSplit: React.Dispatch<React.SetStateAction<Split>>;
        setExpenseSplitType: React.Dispatch<React.SetStateAction<string>>,
        setExpenseSplitMembers: React.Dispatch<React.SetStateAction<User[]>>
    } | undefined;
    FriendsScreen: undefined;
    FriendListScreen: {
        groupPK: string | undefined;
    } | undefined;
    AddFriendScreen: undefined;
    FriendExpenseScreen: {
        friend: User;
    } | undefined;
    GroupExpenseScreen: {
        group: Group | undefined;
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
    ExpenseScreen: undefined;
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
export type FriendListScreenProps = NativeStackScreenProps<RootParamList, "FriendListScreen">;
export type WhoPaidScreenProps = NativeStackScreenProps<RootParamList, "WhoPaidScreen">;
export type AdjustSplitScreenProps = NativeStackScreenProps<RootParamList, "AdjustSplitScreen">;

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
    Owes: Split // Map string to number
}

export type Split = {
    [key: string]: number
}

export type Expense = {
    PK: string
    SK: string
    CreatedAt: Date
    UpdatedAt: Date
    DeletedAt: Date
    Description: string
    Amount: number
    Currency: string
    PaidById: string
    PaidByName: string
    SplitType: string
    Split: Split // Map string to number
    ExpenseDate: Date
    Note: string
    SplitMembers: string[]
    ExpenseType: string
    GroupID: string
}

export type Activity = {
    PK: string
    SK: string
    CreatedAt: Date
    UpdatedAt: Date
    DeletedAt: Date
    ActivityType: ActivityType
    CreatedByID: string
    CreatedByName: string
    GroupID: string
    GroupName: string
    EditedByID: string
    EditedByName: string
    CurrentName: string
    NewName: string
    DeletedByID: string
    DeletedByName: string
    AddedByID: string
    AddedByName: string
    AddedMemberID: string
    AddedMemberName: string
    RemovedByID: string
    RemovedByName: string
    RemovedMemberID: string
    RemovedMemberName: string
    LeftMemberID: string
    LeftMemberName: string
    ExpenseID: string
    ExpenseDescription: string
    CurrentTitle: string
    NewTitle: string
    CurrentAmount: number
    NewAmount: number
}

export enum ActivityType {
    GROUP_CREATED,
    GROUP_EDITED,
    GROUP_DELETED,
    MEMBER_ADDED,
    MEMBER_REMOVED,
    MEMBER_LEFT,
    EXPENSE_ADDED,
    EXPENSE_EDITED,
    EXPENSE_DELETED,
}

