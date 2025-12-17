import React, { Component } from 'react';
import { Text, View, ScrollView, Button, Modal, Alert } from 'react-native';
import { Card } from 'react-native-elements';
import { connect } from 'react-redux';
import { addToCart } from '../redux/ActionCreator';
import { baseUrl, imageUrl } from '../shared/baseUrl';

const mapStateToProps = state => {
    return {
        products: state.products,
        cart: state.cart
    }
}

const mapDispatchToProps = dispatch => ({
    addToCart: (product) => dispatch(addToCart(product))
})

function RenderProduct({ product, addToCart }) {
    if (product != null) {
        return (
            <Card>
                <Card.Title>{product.name}</Card.Title>
                <Card.Divider />
                <Card.Image source={{ uri: imageUrl + product.imageId + '.jpg' }} style={{ resizeMode: 'center', height: 300 }} />
                <Text style={{ margin: 10 }}>
                    {product.description}
                </Text>
                <Text style={{ margin: 10 }}>
                    Serial Number: {product.serialNumber}
                </Text>
                <Text style={{ margin: 10 }}>
                    Performance: {product.performance}
                </Text>
                <Text style={{ margin: 10 }}>
                    Specs: {product.specs}
                </Text>
                <Text style={{ margin: 10, fontWeight: 'bold' }}>
                    Price: ${product.price}
                </Text>
                <Button
                    title="Add to Cart"
                    onPress={() => {
                        addToCart(product);
                        Alert.alert('Added to Cart', product.name + ' added to cart successfully!');
                    }}
                    color="#512DA8"
                />
            </Card>
        );
    }
    else {
        return (<View></View>);
    }
}

class ProductDetail extends Component {

    render() {
        const productId = this.props.route.params.productId;
        const product = this.props.products.products.filter(product => product.id === productId)[0];
        return (
            <ScrollView>
                <RenderProduct product={product} addToCart={this.props.addToCart} />
            </ScrollView>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductDetail);
