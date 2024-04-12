import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootParamList } from './src/types/types';
import { AppScreen } from './src/screens/AppScreen/AppScreen';
import { LoginScreen } from './src/screens/LoginScreen/LogInScreen';
import { Provider } from 'react-redux';
import store from './src/lib/redux/store';
import { AddExpenseScreen } from './src/screens/AddExpenseScreen/AddExpenseScreen';
import { GroupSettingsScreen } from './src/screens/GroupsTab/GroupSettingsScreen';
import { FriendListScreen } from './src/screens/GroupsTab/FriendListScreen';
import { WhoPaidScreen } from './src/screens/WhoPaidScreen/WhoPaidScreen';
import { AdjustSplitScreen } from './src/screens/AdjustSplitScreen/AdjustSplitScreen';
import { ExpenseScreen } from './src/screens/ExpenseScreen/ExpenseScreen';
import { FriendSettingsScreen } from './src/screens/FriendsTab/FriendSettingsScreen';
import { GroupSpendingScreen } from './src/screens/GroupSpendingScreen/GroupSpendingScreen';
import { BalanceToSettleScreen } from './src/screens/BalanceToSettleScreen/BalanceToSettleScreen';
import { RecordPaymentScreen } from './src/screens/RecordPaymentScreen/RecordPaymentScreen';

const Stack = createNativeStackNavigator<RootParamList>();

function App() {
  return (
    <NavigationContainer>
      <Provider store={store}>
        <Stack.Navigator initialRouteName='LogInScreen'>
          <Stack.Screen name="AppScreen" component={AppScreen} options={{
            headerShown: false
          }} />
          <Stack.Screen name="LogInScreen" component={LoginScreen} />
          <Stack.Screen name="AddExpenseScreen" component={AddExpenseScreen} options={{
            headerTitle: "Add expense"
          }} />
          <Stack.Screen name="GroupSettingsScreen" component={GroupSettingsScreen} options={{
            headerTitle: "Group Settings"
          }} />
          <Stack.Screen name="FriendSettingsScreen" component={FriendSettingsScreen} options={{
            headerTitle: "Friend Settings"
          }} />
          <Stack.Screen name="FriendListScreen" component={FriendListScreen} options={{
            headerTitle: "Friends"
          }} />
          <Stack.Screen name="WhoPaidScreen" component={WhoPaidScreen} options={{
            headerTitle: "Who Paid?"
          }} />
          <Stack.Screen name="AdjustSplitScreen" component={AdjustSplitScreen} options={{
            headerTitle: "Adjust Split"
          }} />
          <Stack.Screen name="ExpenseScreen" component={ExpenseScreen} options={{
            headerShown: false
          }} />
          <Stack.Screen name="GroupSpendingScreen" component={GroupSpendingScreen} options={{
            headerShown: true,
            title: "Group spending summary"
          }} />
          <Stack.Screen name="BalanceToSettleScreen" component={BalanceToSettleScreen} options={{
            headerShown: true,
            title: "Select a balance to settle"
          }} />
          <Stack.Screen name="RecordPaymentScreen" component={RecordPaymentScreen} options={{
            headerShown: true,
            title: "Record payment"
          }} />
        </Stack.Navigator>
      </Provider>
    </NavigationContainer>
  );
}
export default App;