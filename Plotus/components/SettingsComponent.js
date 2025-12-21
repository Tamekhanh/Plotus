import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Input, Button } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setBaseUrl } from '../shared/baseUrl';
import { connect } from 'react-redux';
import { fetchProducts, fetchPromotions, fetchPartners, fetchOrders } from '../redux/ActionCreator';

const mapDispatchToProps = dispatch => ({
    fetchProducts: () => dispatch(fetchProducts()),
    fetchPromotions: () => dispatch(fetchPromotions()),
    fetchPartners: () => dispatch(fetchPartners()),
    fetchOrders: () => dispatch(fetchOrders())
});

class Settings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ip: ''
        };
    }

    async componentDidMount() {
        try {
            const ip = await AsyncStorage.getItem('serverIp');
            if (ip) {
                this.setState({ ip });
            }
        } catch (error) {
            console.error('Failed to load IP', error);
        }
    }

    saveIp = async () => {
        try {
            await AsyncStorage.setItem('serverIp', this.state.ip);
            setBaseUrl(this.state.ip);
            
            this.props.fetchProducts();
            this.props.fetchPromotions();
            this.props.fetchPartners();
            this.props.fetchOrders();

            alert('IP Saved & Data Refreshed!');
        } catch (error) {
            console.error('Failed to save IP', error);
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Server Settings</Text>
                <Input
                    placeholder='Enter New Server IPv4'
                    leftIcon={{ type: 'font-awesome', name: 'server' }}
                    onChangeText={value => this.setState({ ip: value })}
                    value={this.state.ip}
                />
                <Button
                    title='Save'
                    onPress={this.saveIp}
                    buttonStyle={styles.button}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        margin: 20
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20
    },
    button: {
        backgroundColor: '#512DA8',
        marginTop: 20
    }
});

export default connect(null, mapDispatchToProps)(Settings);
