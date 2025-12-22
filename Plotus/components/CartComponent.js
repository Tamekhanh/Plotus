import React, { Component } from 'react';
import { View, FlatList, Text, Alert, TouchableOpacity, Modal, ScrollView, Image } from 'react-native';
import { ListItem, Avatar, Button, Icon, Input, CheckBox } from 'react-native-elements';
import { connect } from 'react-redux';
import { deleteFromCart, addToCart, decreaseFromCart, postOrder } from '../redux/ActionCreator';
import { baseUrl, imageUrl } from '../shared/baseUrl';
import CartScannerComponent from './CartScannerComponent';

const mapStateToProps = state => {
    return {
        cart: state.cart,
        products: state.products
    }
}

const mapDispatchToProps = dispatch => ({
    deleteFromCart: (productId) => dispatch(deleteFromCart(productId)),
    addToCart: (product) => dispatch(addToCart(product)),
    decreaseFromCart: (productId) => dispatch(decreaseFromCart(productId)),
    postOrder: (orderInfo) => dispatch(postOrder(orderInfo))
})

class Cart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isScannerVisible: false,
            isCheckoutModalVisible: false,
            isQRModalVisible: false,
            paymentMethod: 'Cash',
            deliveryMethod: 'At Store',
            address: '',
            deliveryFee: 0,
            customerName: '',
            email: '',
            phone: '',
            taxCode: ''
        };
    }

    resetState = () => {
        this.setState({
            isScannerVisible: false,
            isCheckoutModalVisible: false,
            isQRModalVisible: false,
            paymentMethod: 'Cash',
            deliveryMethod: 'At Store',
            address: '',
            deliveryFee: 0,
            customerName: '',
            email: '',
            phone: '',
            taxCode: ''
        });
    }

    handleScan = ({ type, data, continuous }) => {
        if (!continuous) {
            this.setState({ isScannerVisible: false });
        }
        const scannedData = data.trim();
        const product = this.props.products.products.find(p => p.id.toString() === scannedData || p.serialNumber === scannedData);

        if (product) {
            const cartItem = this.props.cart.find(c => c.id === product.id);
            const currentQty = cartItem ? cartItem.quantity : 0;
            const stock = parseInt(product.quantity);

            if (currentQty >= stock) {
                Alert.alert('Error', 'Stock limit reached');
                return;
            }

            this.props.addToCart(product);
            if (!continuous) {
                Alert.alert('Success', `Added ${product.name} to cart!`);
            }
        } else {
            Alert.alert('Product not found!');
        }
    }

    render() {

        const renderCartItem = ({ item, index }) => {
            const imageSource = (item.image && (item.image.startsWith('file://') || item.image.startsWith('http')))
                ? { uri: item.image }
                : { uri: imageUrl + item.imageId + '.jpg' };

            return (
                <ListItem key={index} bottomDivider containerStyle={{ paddingVertical: 15 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15, flex: 1 }}>
                        <Avatar source={imageSource} size="medium" rounded />
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
                                <TouchableOpacity onPress={() => {
                                    const productInStore = this.props.products.products.find(p => p.id === item.id);
                                    const stock = productInStore ? parseInt(productInStore.quantity) : 0;

                                    if (item.quantity >= stock) {
                                        Alert.alert('Limit Reached', 'Cannot add more than available stock');
                                        return;
                                    }
                                    this.props.addToCart(item);
                                }}>
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
                    <Button
                        title="Scan Product"
                        icon={<Icon name='barcode-scan' type='material-community' color='white' size={20} style={{ marginRight: 10 }} />}
                        buttonStyle={{ backgroundColor: '#512DA8', marginTop: 20, paddingHorizontal: 30 }}
                        onPress={() => this.setState({ isScannerVisible: true })}
                    />
                    <CartScannerComponent
                        visible={this.state.isScannerVisible}
                        onScanned={this.handleScan}
                        onClose={() => this.setState({ isScannerVisible: false })}
                        products={this.props.products.products}
                    />
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
            const total = subtotal - discount + this.state.deliveryFee;

            return (
                <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
                    <Button
                        title="Scan Product"
                        icon={<Icon name='barcode-scan' type='material-community' color='white' size={20} style={{ marginRight: 10 }} />}
                        buttonStyle={{ backgroundColor: '#512DA8', margin: 10 }}
                        onPress={() => this.setState({ isScannerVisible: true })}
                    />
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
                            onPress={() => this.setState({ isCheckoutModalVisible: true })}
                        />
                    </View>

                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={this.state.isCheckoutModalVisible}
                        onRequestClose={() => this.setState({ isCheckoutModalVisible: false })}
                    >
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                            <View style={{ width: '90%', backgroundColor: 'white', borderRadius: 20, padding: 20, maxHeight: '80%' }}>
                                <ScrollView>
                                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 10 }}>Customer Info</Text>
                                    <Input
                                        placeholder='Name'
                                        leftIcon={{ type: 'font-awesome', name: 'user' }}
                                        onChangeText={value => this.setState({ customerName: value })}
                                        value={this.state.customerName}
                                    />
                                    <Input
                                        placeholder='Email'
                                        leftIcon={{ type: 'font-awesome', name: 'envelope' }}
                                        onChangeText={value => this.setState({ email: value })}
                                        value={this.state.email}
                                    />
                                    <Input
                                        placeholder='Phone'
                                        leftIcon={{ type: 'font-awesome', name: 'phone' }}
                                        onChangeText={value => this.setState({ phone: value })}
                                        value={this.state.phone}
                                        keyboardType='phone-pad'
                                    />
                                    <Input
                                        placeholder='Tax Code'
                                        leftIcon={{ type: 'font-awesome', name: 'file-text-o' }}
                                        onChangeText={value => this.setState({ taxCode: value })}
                                        value={this.state.taxCode}
                                    />

                                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 10 }}>Payment Method</Text>
                                    <CheckBox
                                        title='Cash'
                                        checked={this.state.paymentMethod === 'Cash'}
                                        onPress={() => this.setState({ paymentMethod: 'Cash' })}
                                        checkedIcon='dot-circle-o'
                                        uncheckedIcon='circle-o'
                                    />
                                    <CheckBox
                                        title='Bank Transfer'
                                        checked={this.state.paymentMethod === 'Bank Transfer'}
                                        onPress={() =>
                                            this.setState({
                                                paymentMethod: 'Bank Transfer',
                                                isQRModalVisible: true, // 👈 mở dialog QR
                                            })
                                        }
                                        checkedIcon='dot-circle-o'
                                        uncheckedIcon='circle-o'
                                    />


                                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 10 }}>Delivery Method</Text>
                                    <CheckBox
                                        title='At Store'
                                        checked={this.state.deliveryMethod === 'At Store'}
                                        onPress={() => this.setState({ deliveryMethod: 'At Store', deliveryFee: 0 })}
                                        checkedIcon='dot-circle-o'
                                        uncheckedIcon='circle-o'
                                    />
                                    <CheckBox
                                        title='Delivery'
                                        checked={this.state.deliveryMethod === 'Delivery'}
                                        onPress={() => this.setState({ deliveryMethod: 'Delivery', deliveryFee: 5.00 })}
                                        checkedIcon='dot-circle-o'
                                        uncheckedIcon='circle-o'
                                    />

                                    {(this.state.deliveryMethod === 'Delivery' || this.state.customerName !== '') && (
                                        <Input
                                            placeholder='Enter Address'
                                            leftIcon={{ type: 'font-awesome', name: 'map-marker' }}
                                            onChangeText={value => this.setState({ address: value })}
                                            value={this.state.address}
                                        />
                                    )}

                                    <View style={{ marginTop: 20, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                                            <Text style={{ fontSize: 16 }}>Subtotal:</Text>
                                            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>${subtotal.toFixed(2)}</Text>
                                        </View>
                                        {discount > 0 && (
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                                                <Text style={{ fontSize: 16, color: 'green' }}>Discount:</Text>
                                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'green' }}>-${discount.toFixed(2)}</Text>
                                            </View>
                                        )}
                                        {this.state.deliveryFee > 0 && (
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                                                <Text style={{ fontSize: 16 }}>Delivery Fee:</Text>
                                                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>${this.state.deliveryFee.toFixed(2)}</Text>
                                            </View>
                                        )}
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                                            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Total:</Text>
                                            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#512DA8' }}>${(total + this.state.deliveryFee).toFixed(2)}</Text>
                                        </View>
                                    </View>

                                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 30 }}>
                                        <Button
                                            title="Cancel"
                                            type="outline"
                                            buttonStyle={{ borderColor: 'red', width: 120 }}
                                            titleStyle={{ color: 'red' }}
                                            onPress={() => this.setState({ isCheckoutModalVisible: false })}
                                        />
                                        <Button
                                            title="Confirm"
                                            buttonStyle={{ backgroundColor: '#512DA8', width: 120 }}
                                            onPress={() => {
                                                if (this.state.deliveryMethod === 'Delivery') {
                                                    if (!this.state.address || !this.state.customerName || !this.state.phone) {
                                                        Alert.alert('Error', 'Please enter Name, Phone and Address for delivery');
                                                        return;
                                                    }
                                                }

                                                const finalTotal = total + this.state.deliveryFee;

                                                this.props.postOrder({
                                                    cart: this.props.cart,
                                                    paymentMethod: this.state.paymentMethod,
                                                    deliveryMethod: this.state.deliveryMethod,
                                                    address: this.state.address,
                                                    deliveryFee: this.state.deliveryFee,
                                                    customerName: this.state.customerName || 'Retail customers',
                                                    email: this.state.email,
                                                    phone: this.state.phone,
                                                    taxCode: this.state.taxCode,
                                                    total: finalTotal
                                                })
                                                    .then(() => {
                                                        this.resetState();
                                                    });
                                            }}
                                        />
                                    </View>
                                </ScrollView>
                            </View>
                        </View>
                    </Modal>

                    <Modal
                        animationType="fade"
                        transparent
                        visible={this.state.isQRModalVisible}
                        onRequestClose={() => this.setState({ isQRModalVisible: false })}
                    >
                        <View style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'rgba(0,0,0,0.8)'
                        }}>
                            <View style={{
                                width: '80%',
                                backgroundColor: 'white',
                                borderRadius: 20,
                                padding: 20,
                                alignItems: 'center'
                            }}>
                                <Text style={{
                                    fontSize: 22,
                                    fontWeight: 'bold',
                                    marginBottom: 20,
                                    color: '#512DA8'
                                }}>
                                    Scan to Pay
                                </Text>

                                <Image
                                    source={{ uri: baseUrl + 'images/payment/QRPayment.png' }}
                                    style={{ width: 200, height: 200, marginBottom: 20 }}
                                    resizeMode="contain"
                                />

                                <Text style={{
                                    textAlign: 'center',
                                    marginBottom: 20,
                                    color: 'gray'
                                }}>
                                    Please scan this QR code with your banking app to complete the transfer.
                                </Text>

                                <Button
                                    title="Close"
                                    buttonStyle={{
                                        backgroundColor: '#512DA8',
                                        paddingHorizontal: 30
                                    }}
                                    onPress={() => this.setState({ isQRModalVisible: false })}
                                />
                            </View>
                        </View>
                    </Modal>


                    <CartScannerComponent
                        visible={this.state.isScannerVisible}
                        onScanned={this.handleScan}
                        onClose={() => this.setState({ isScannerVisible: false })}
                        products={this.props.products.products}
                    />


                </View>
            );
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Cart);
