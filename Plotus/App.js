import React from 'react';
import Main from './components/MainComponent';
import { Provider } from 'react-redux';
import { ConfigureStore } from './redux/configureStore';
import Toast from 'react-native-toast-message';

const store = ConfigureStore();

export default function App() {
  return (
    <Provider store={store}>
      <Main />
      <Toast />
    </Provider>
  );
}

