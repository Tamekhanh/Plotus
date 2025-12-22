import React, { Component } from 'react';
import Main from './components/MainComponent';
import { Provider } from 'react-redux';
import { ConfigureStore } from './redux/configureStore';
import Toast from 'react-native-toast-message';
import { LogBox } from 'react-native';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const store = ConfigureStore();

export default class App extends Component {
  constructor(props) {
    super(props);
    LogBox.ignoreLogs([
    'expo-notifications: Android Push notifications (remote notifications) functionality provided by expo-notifications was removed from Expo Go with the release of SDK 53. Use a development build instead of Expo Go. Read more at https://docs.expo.dev/develop/development-builds/introduction/.'
    ]);
  };
  render() {
    return (
      <Provider store={store}>
        <Main />
        <Toast />
      </Provider>
    );
  }
}

