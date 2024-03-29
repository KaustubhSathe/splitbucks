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
        expenseSplit: Map<string, number>;
        setExpenseSplit: React.Dispatch<React.SetStateAction<Map<string, number>>>;
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
    Owes: Map<string, number>
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
    PaidBy: string
    SplitType: string
    Split: Map<string, number>
    ExpenseDate: Date
    Note: string
    SplitMembers: string[]
    ExpenseType: string
    GroupID: string
}
