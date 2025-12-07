import React, { Component } from 'react';
import { View, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

import Home from './HomeComponent';
import Menu from './MenuComponent';
import ProductDetail from './ProductDetailComponent';

const MenuNavigator = createStackNavigator();

function MenuNavigatorScreen() {
    return (
        <MenuNavigator.Navigator
            initialRouteName='Menu'
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#512DA8'
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    color: '#fff'
                }
            }}
        >
            <MenuNavigator.Screen
                name="Menu"
                component={Menu}
                options={{ title: 'Menu' }}
            />
            <MenuNavigator.Screen
                name="ProductDetail"
                component={ProductDetail}
                options={{ title: 'Product Detail' }}
            />
        </MenuNavigator.Navigator>
    );
}

const HomeNavigator = createStackNavigator();

function HomeNavigatorScreen() {
    return (
        <HomeNavigator.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#512DA8'
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    color: '#fff'
                }
            }}
        >
            <HomeNavigator.Screen
                name="Home"
                component={Home}
                options={{ title: 'Home' }}
            />
        </HomeNavigator.Navigator>
    );
}

const MainNavigator = createDrawerNavigator();

function MainNavigatorScreen() {
    return (
        <MainNavigator.Navigator
            screenOptions={{
                drawerStyle: {
                    backgroundColor: '#D1C4E9'
                },
                headerShown: false
            }}
        >
            <MainNavigator.Screen
                name="Home"
                component={HomeNavigatorScreen}
                options={{ title: 'Home', drawerLabel: 'Home' }}
            />
            <MainNavigator.Screen
                name="Menu"
                component={MenuNavigatorScreen}
                options={{ title: 'Menu', drawerLabel: 'Menu' }}
            />
        </MainNavigator.Navigator>
    );
}

class Main extends Component {
    render() {
        return (
            <View style={{ flex: 1, paddingTop: Platform.OS === 'ios' ? 0 : 0 }}>
                <NavigationContainer>
                    <MainNavigatorScreen />
                </NavigationContainer>
            </View>
        );
    }
}

export default Main;
