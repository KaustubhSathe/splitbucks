import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootParamList } from './src/types/types';
import { AppScreen } from './src/screens/AppScreen/AppScreen';
import { LoginScreen } from './src/screens/LoginScreen/LogInScreen';
import { Provider } from 'react-redux';
import store from './src/lib/redux/store';
import { AddExpenseScreen } from './src/screens/AddExpenseScreen/AddExpenseScreen';

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
        </Stack.Navigator>
      </Provider>
    </NavigationContainer>
  );
}
export default App;