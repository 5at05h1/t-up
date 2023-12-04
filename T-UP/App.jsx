import React,{useState,useEffect} from 'react';
import { View, LogBox, Image, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import Feather from 'react-native-vector-icons/Feather';
import { RootSiblingParent } from 'react-native-root-siblings';

import LogInScreen from './src/screens/LogInScreen';
import CommunicationHistoryScreen from './src/screens/CommunicationHistoryScreen';
import TalkScreen from './src/screens/TalkScreen';
import Setting from './src/screens/Setting';
import Schedule from './src/screens/Schedule';

const Stack = createStackNavigator();
LogBox.ignoreLogs(['Setting a timer']);

function Logo() {
  return (
    <View>
      <Image
        source={require('./assets/logo.png')}
      />
    </View>
  )
}

export default function App() {
  
  return (
    <RootSiblingParent>
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="LogIn"
        screenOptions={{
          headerStyle: { backgroundColor: '#1f2d53', height: 110},
          title: ( <Logo /> ),
          headerTitleStyle: {},
          headerTitleAlign: 'center',
          headerTintColor: '#ffffff',
          headerBackTitle: (<Feather name='chevron-left' color='white' size={30} />),
          headerBackTitleVisible: false,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      >
        <Stack.Screen
          name="CommunicationHistory"
          component={CommunicationHistoryScreen}
          options={{
            gestureDirection: "horizontal-inverted",
          }}
        />
        <Stack.Screen
          name="TalkScreen"
          component={TalkScreen}
        />
        <Stack.Screen
          name="LogIn"
          component={LogInScreen}
        />
        <Stack.Screen
          name="Setting"
          component={Setting}
        />
        <Stack.Screen
          name="Schedule"
          component={Schedule}
        />
      </Stack.Navigator>
    </NavigationContainer>
    </RootSiblingParent>
  );
}
