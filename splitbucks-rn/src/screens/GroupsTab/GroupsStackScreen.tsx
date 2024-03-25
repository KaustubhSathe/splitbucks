import { RootParamList } from "../../types/types";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { CreateGroupScreen } from "./CreateGroupScreen";
import { GroupDashboardScreen } from "./GroupDashboardScreen";
import { GroupExpenseScreen } from "./GroupExpenseScreen";

const GroupsStack = createNativeStackNavigator<RootParamList>()

export function GroupStackScreen() {
    return (
        <GroupsStack.Navigator screenOptions={{
            headerShown: false,
            statusBarColor: 'red'
        }}>
            <GroupsStack.Screen name="GroupDashboardScreen" component={GroupDashboardScreen} />
            <GroupsStack.Screen name="CreateGroupScreen" component={CreateGroupScreen} />
            <GroupsStack.Screen name="GroupExpenseScreen" component={GroupExpenseScreen} />
        </GroupsStack.Navigator >
    )
}

