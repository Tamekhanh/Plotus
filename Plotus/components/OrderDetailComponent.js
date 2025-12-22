import React, { Component } from 'react';
import { View, Text, FlatList, ScrollView, StyleSheet, Alert, Modal, Image } from 'react-native';
import { Card, Icon, ListItem, Avatar, Button } from 'react-native-elements';
import { connect } from 'react-redux';
import { baseUrl, imageUrl } from '../shared/baseUrl';
import { confirmOrder, cancelOrder } from '../redux/ActionCreator';

const mapStateToProps = state => {
    return {
        orders: state.orders
    }
}

const mapDispatchToProps = dispatch => ({
    confirmOrder: (orderId) => dispatch(confirmOrder(orderId)),
    cancelOrder: (orderId) => dispatch(cancelOrder(orderId))
})

class OrderDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isQRModalVisible: false
        };
    }

    render() {
        const orderId = this.props.route.params.orderId;
        const order = this.props.orders.orders.find(order => order.id === orderId);

        if (!order) {
            return (<View><Text>Order not found</Text></View>);
        }

        const TAX_RATE = 0.08; // 8% Tax
        const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * TAX_RATE;
        const total = subtotal + tax;
        const status = order.status || 'Processing';

        const renderOrderItem = ({ item, index }) => {
            const imageSource = (item.image && (item.image.startsWith('file://') || item.image.startsWith('http'))) 
                ? { uri: item.image } 
                : { uri: imageUrl + item.imageId + '.jpg' };

            return (
                <ListItem key={index} bottomDivider>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, justifyContent: 'space-between' }}>
                        <Avatar source={imageSource} />
                    
                    <ListItem.Content>
                        <ListItem.Title>{item.name}</ListItem.Title>
                        <ListItem.Subtitle>Qty: {item.quantity}</ListItem.Subtitle>
                        <ListItem.Subtitle>Price: ${item.price}</ListItem.Subtitle>
                    </ListItem.Content>
                    <Text style={{ fontWeight: 'bold' }}>${item.price * item.quantity}</Text>
                    </View>
                </ListItem>
            );
        };

        return (
            <ScrollView>
                <Card style={{ flexDirection : 'row' }}>
                    <Card.Title>Order Details</Card.Title>
                    <Card.Divider />
                    <View style={{ marginBottom: 10 }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Order ID: {order.id}</Text>
                        <Text>Date: {new Date(order.date).toLocaleString()}</Text>
                        <Text style={{ marginTop: 5, fontWeight: 'bold', color: status === 'Delivered' ? 'green' : status === 'Cancelled' ? 'red' : 'blue' }}>
                            Status: {status}
                        </Text>
                        {order.confirmed && (
                            <Text style={{ color: 'green', fontWeight: 'bold', marginTop: 5 }}>
                                Confirmed: {new Date(order.confirmedDate).toLocaleString()}
                            </Text>
                        )}
                        
                        {order.customerName && <Text style={{ marginTop: 5 }}>Customer: {order.customerName}</Text>}
                        {order.email && <Text>Email: {order.email}</Text>}
                        {order.phone && <Text>Phone: {order.phone}</Text>}
                        {order.taxCode && <Text>Tax Code: {order.taxCode}</Text>}
                        {order.address && <Text>Address: {order.address}</Text>}
                    </View>
                    <Card.Divider />
                    <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Items:</Text>
                    {order.items.map((item, index) => renderOrderItem({ item, index }))}
                    <Card.Divider />
                    <View style={{ margin: 10 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                            <Text>Subtotal:</Text>
                            <Text>${subtotal.toFixed(2)}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                            <Text>Tax (8%):</Text>
                            <Text>${tax.toFixed(2)}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#512DA8' }}>Total:</Text>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#512DA8' }}>${total.toFixed(2)}</Text>
                        </View>
                    </View>
                    {status === 'Processing' && (
                        <View>
                            {order.paymentMethod === 'Bank Transfer' && (
                                <Button
                                    title="Show Payment QR"
                                    icon={<Icon name='qrcode' type='font-awesome' color='white' size={20} style={{ marginRight: 10 }} />}
                                    buttonStyle={{ backgroundColor: '#28a745', marginTop: 20 }}
                                    onPress={() => this.setState({ isQRModalVisible: true })}
                                />
                            )}
                            <Button
                                title="Confirm Order"
                                buttonStyle={{ backgroundColor: '#512DA8', marginTop: 10 }}
                                onPress={() => {
                                    Alert.alert(
                                        'Confirm Order',
                                        'Are you sure you want to confirm this order?',
                                        [
                                            { text: 'Cancel', style: 'cancel' },
                                            { text: 'OK', onPress: () => this.props.confirmOrder(order.id) }
                                        ],
                                        { cancelable: false }
                                    );
                                }}
                            />
                            <Button
                                title="Cancel Order"
                                buttonStyle={{ backgroundColor: 'red', marginTop: 10 }}
                                onPress={() => {
                                    Alert.alert(
                                        'Cancel Order',
                                        'Are you sure you want to cancel this order?',
                                        [
                                            { text: 'No', style: 'cancel' },
                                            { text: 'Yes', onPress: () => this.props.cancelOrder(order.id) }
                                        ],
                                        { cancelable: false }
                                    );
                                }}
                            />
                        </View>
                    )}
                </Card>
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={this.state.isQRModalVisible}
                    onRequestClose={() => this.setState({ isQRModalVisible: false })}
                >
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)' }}>
                        <View style={{ width: '80%', backgroundColor: 'white', borderRadius: 20, padding: 20, alignItems: 'center' }}>
                            <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#512DA8' }}>Scan to Pay</Text>
                            <Image
                                source={{ uri: baseUrl + 'images/payment/QRPayment.png' }}
                                style={{ width: 200, height: 200, marginBottom: 20 }}
                            />
                            <Text style={{ textAlign: 'center', marginBottom: 20, color: 'gray' }}>
                                Please scan this QR code with your banking app to complete the transfer.
                            </Text>
                            <Button
                                title="Close"
                                buttonStyle={{ backgroundColor: '#512DA8', paddingHorizontal: 30 }}
                                onPress={() => this.setState({ isQRModalVisible: false })}
                            />
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(OrderDetail);
