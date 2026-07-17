import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import { PaperProvider } from 'react-native-paper';
import MainScreen from './src/screens/MainScreen';
import RecitationScreen from './src/screens/RecitationScreen';
import ProgressScreen from './src/screens/ProgressScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator 
            initialRouteName="Main"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#1976D2',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen 
              name="Main" 
              component={MainScreen}
              options={{ title: 'ترتيل بلس' }}
            />
            <Stack.Screen 
              name="Recitation" 
              component={RecitationScreen}
              options={{ title: 'الترتيل' }}
            />
            <Stack.Screen 
              name="Progress" 
              component={ProgressScreen}
              options={{ title: 'التقدم' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </Provider>
  );
}
