import React, { Component } from 'react';
import { View, FlatList, Text, TouchableOpacity, Modal, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { ListItem, Card, Icon, Button, CheckBox } from 'react-native-elements';
import { connect } from 'react-redux';
import { fetchOrders } from '../redux/ActionCreator';

const mapStateToProps = state => {
    return {
        orders: state.orders
    }
}

const mapDispatchToProps = dispatch => ({
    fetchOrders: () => dispatch(fetchOrders())
})

class Order extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showFilter: false,
            filterStatus: 'All',
            sortOrder: 'desc'
        };
    }

    componentDidMount() {
        this.props.fetchOrders();
    }

    render() {

        const renderOrderItem = ({ item, index }) => {
            return (
                <TouchableOpacity onPress={() => this.props.navigation.navigate('OrderDetail', { orderId: item.id })}>
                    <Card key={index}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Card.Title>Order ID: {item.id}</Card.Title>
                            <Icon name="chevron-right" type="font-awesome" color="#512DA8" />
                        </View>
                        <Card.Divider />
                        <Text style={{ margin: 10 }}>Date: {new Date(item.date).toLocaleString()}</Text>
                        {item.customerName && <Text style={{ margin: 10 }}>Customer: {item.customerName}</Text>}
                        <Text style={{ margin: 10, fontWeight: 'bold' }}>Total: ${item.total}</Text>
                        <Text style={{ margin: 10, color: 'blue' }}>Status: {item.status || 'Processing'}</Text>
                        <Text style={{ margin: 10, color: 'gray' }}>{item.items.length} Items</Text>
                    </Card>
                </TouchableOpacity>
            );
        };

        if (this.props.orders.isLoading && this.props.orders.orders.length === 0) {
            return (
                <View>
                    <Text>Loading...</Text>
                </View>
            );
        }
        else if (this.props.orders.errMess) {
            return (
                <View>
                    <Text>{this.props.orders.errMess}</Text>
                </View>
            );
        }
        else {
            const filteredOrders = this.props.orders.orders.filter(order => {
                if (this.state.filterStatus === 'All') return true;
                return (order.status || 'Processing') === this.state.filterStatus;
            }).sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return this.state.sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
            });

            return (
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', padding: 10, backgroundColor: '#ddd' }}>
                        <Button
                            title={`Filter: ${this.state.filterStatus}`}
                            onPress={() => this.setState({ showFilter: true })}
                            buttonStyle={{ backgroundColor: '#512DA8' }}
                        />
                        <Button
                            title={`Sort: ${this.state.sortOrder === 'desc' ? 'Newest' : 'Oldest'}`}
                            onPress={() => this.setState({ sortOrder: this.state.sortOrder === 'desc' ? 'asc' : 'desc' })}
                            buttonStyle={{ backgroundColor: '#512DA8' }}
                        />
                    </View>
                    <FlatList
                        data={filteredOrders}
                        renderItem={renderOrderItem}
                        keyExtractor={item => item.id.toString()}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.props.orders.isLoading}
                                onRefresh={() => this.props.fetchOrders()}
                            />
                        }
                    />
                    <Modal
                        animationType={'slide'}
                        transparent={false}
                        visible={this.state.showFilter}
                        onRequestClose={() => this.setState({ showFilter: false })}
                    >
                        <View style={styles.modal}>
                            <Text style={styles.modalTitle}>Filter Status</Text>
                            {['All', 'Processing', 'Delivered', 'Cancelled'].map(status => (
                                <CheckBox
                                    key={status}
                                    title={status}
                                    checked={this.state.filterStatus === status}
                                    onPress={() => this.setState({ filterStatus: status, showFilter: false })}
                                />
                            ))}
                            <Button
                                onPress={() => this.setState({ showFilter: false })}
                                color="#512DA8"
                                title="Close"
                            />
                        </View>
                    </Modal>
                </View>
            );
        }
    }
}

const styles = StyleSheet.create({
    modal: {
        justifyContent: 'center',
        margin: 20
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        backgroundColor: '#512DA8',
        textAlign: 'center',
        color: 'white',
        marginBottom: 20
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(Order);
