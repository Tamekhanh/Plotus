import React, { Component } from 'react';
import { View, FlatList, Text, Alert, TouchableOpacity } from 'react-native';
import { ListItem, Avatar, Button, Icon } from 'react-native-elements';
import { connect } from 'react-redux';
import { deleteFromCart, addToCart, decreaseFromCart, postOrder } from '../redux/ActionCreator';
import { baseUrl, imageUrl } from '../shared/baseUrl';

const mapStateToProps = state => {
    return {
        cart: state.cart
    }
}

const mapDispatchToProps = dispatch => ({
    deleteFromCart: (productId) => dispatch(deleteFromCart(productId)),
    addToCart: (product) => dispatch(addToCart(product)),
    decreaseFromCart: (productId) => dispatch(decreaseFromCart(productId)),
    postOrder: (cart) => dispatch(postOrder(cart))
})

class Cart extends Component {

    render() {

        const renderCartItem = ({ item, index }) => {
            return (
                <ListItem key={index} bottomDivider containerStyle={{ paddingVertical: 15 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15, flex: 1 }}>
                        <Avatar source={{ uri: imageUrl + item.imageId + '.jpg' }} size="medium" rounded />
                        <ListItem.Content>
                            <ListItem.Title style={{ fontWeight: 'bold', fontSize: 16 }}>{item.name}</ListItem.Title>
                            <ListItem.Subtitle style={{ color: 'gray', marginTop: 5 }}>
                                ${item.price}
                            </ListItem.Subtitle>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                                <TouchableOpacity onPress={() => this.props.decreaseFromCart(item.id)}>
                                    <Icon name='minus-circle-outline' type='material-community' color='#512DA8' size={30} />
                                </TouchableOpacity>
                                <Text style={{ marginHorizontal: 10, fontSize: 18, fontWeight: 'bold' }}>{item.quantity}</Text>
                                <TouchableOpacity onPress={() => this.props.addToCart(item)}>
                                    <Icon name='plus-circle-outline' type='material-community' color='#512DA8' size={30} />
                                </TouchableOpacity>
                            </View>
                            <Text style={{ marginTop: 5, fontWeight: 'bold', color: '#512DA8' }}>
                                Subtotal: ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                            </Text>
                        </ListItem.Content>
                        <Button
                            icon={<Icon name='trash-can-outline' type='material-community' color='red' size={25} />}
                            type="clear"
                            onPress={() => {
                                Alert.alert(
                                    'Delete Item?',
                                    'Are you sure you wish to delete ' + item.name + ' from cart?',
                                    [
                                        {
                                            text: 'Cancel',
                                            onPress: () => console.log(item.name + ' Not Deleted'),
                                            style: 'cancel'
                                        },
                                        {
                                            text: 'OK',
                                            onPress: () => this.props.deleteFromCart(item.id)
                                        }
                                    ],
                                    { cancelable: false }
                                );
                            }}
                        />
                    </View>
                </ListItem>
            );
        };

        if (this.props.cart.length === 0) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
                    <Icon name='cart-off' type='material-community' size={80} color='#ccc' />
                    <Text style={{ fontSize: 20, color: 'gray', marginTop: 20 }}>Your cart is empty!</Text>
                </View>
            );
        }
        else {
            const subtotal = this.props.cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
            const discount = this.props.cart.reduce((sum, item) => {
                if (item.category === 'accessories') {
                    return sum + (parseFloat(item.price) * item.quantity * 0.2);
                }
                return sum;
            }, 0);
            const total = subtotal - discount;

            return (
                <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
                    <FlatList
                        data={this.props.cart}
                        renderItem={renderCartItem}
                        keyExtractor={item => item.id.toString()}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                    <View style={{ padding: 20, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#e1e1e1', elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5, alignItems: 'center' }}>
                            <Text style={{ fontSize: 16, color: 'gray' }}>Subtotal:</Text>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'black' }}>
                                ${subtotal.toFixed(2)}
                            </Text>
                        </View>
                        {discount > 0 && (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5, alignItems: 'center' }}>
                                <Text style={{ fontSize: 16, color: 'green' }}>Discount (Accessories 20%):</Text>
                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'green' }}>
                                    -${discount.toFixed(2)}
                                </Text>
                            </View>
                        )}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, alignItems: 'center' }}>
                            <Text style={{ fontSize: 18, color: 'gray' }}>Total:</Text>
                            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#512DA8' }}>
                                ${total.toFixed(2)}
                            </Text>
                        </View>
                        <Button
                            title="CHECKOUT"
                            buttonStyle={{ backgroundColor: '#512DA8', borderRadius: 10, paddingVertical: 12 }}
                            titleStyle={{ fontWeight: 'bold', fontSize: 18 }}
                            onPress={() => {
                                Alert.alert(
                                    'Confirm Order',
                                    'Do you want to place this order?',
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        { text: 'OK', onPress: () => this.props.postOrder(this.props.cart) }
                                    ],
                                    { cancelable: false }
                                );
                            }}
                        />
                    </View>
                </View>
            );
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Cart);
