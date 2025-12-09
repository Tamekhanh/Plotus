import React, { Component } from 'react';
import { View, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

import Home from './HomeComponent';
import Menu from './MenuComponent';
import ProductDetail from './ProductDetailComponent';
import Partner from './PartnerComponent';
import Cart from './CartComponent';

const MenuNavigator = createStackNavigator();

function MenuNavigatorScreen() {
    return (
        <MenuNavigator.Navigator
            initialRouteName='MenuScreen'
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
                name="MenuScreen"
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
                name="HomeScreen"
                component={Home}
                options={{ title: 'Home' }}
            />
        </HomeNavigator.Navigator>
    );
}

const PartnerNavigator = createStackNavigator();

function PartnerNavigatorScreen() {
    return (
        <PartnerNavigator.Navigator
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
            <PartnerNavigator.Screen
                name="PartnerScreen"
                component={Partner}
                options={{ title: 'Partners' }}
            />
        </PartnerNavigator.Navigator>
    );
}

const CartNavigator = createStackNavigator();

function CartNavigatorScreen() {
    return (
        <CartNavigator.Navigator
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
            <CartNavigator.Screen
                name="CartScreen"
                component={Cart}
                options={{ title: 'My Cart' }}
            />
        </CartNavigator.Navigator>
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
            <MainNavigator.Screen
                name="Partner"
                component={PartnerNavigatorScreen}
                options={{ title: 'Partners', drawerLabel: 'Partners' }}
            />
            <MainNavigator.Screen
                name="Cart"
                component={CartNavigatorScreen}
                options={{ title: 'My Cart', drawerLabel: 'My Cart' }}
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
