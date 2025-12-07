import React, { Component } from 'react';
import { Text, View, ScrollView } from 'react-native';
import { Card } from 'react-native-elements';
import { connect } from 'react-redux';

const mapStateToProps = state => {
    return {
        products: state.products
    }
}

function RenderProduct({ product }) {
    if (product != null) {
        return (
            <Card>
                <Card.Title>{product.name}</Card.Title>
                <Card.Divider />
                <Card.Image source={{ uri: product.image }} />
                <Text style={{ margin: 10 }}>
                    {product.description}
                </Text>
                <Text style={{ margin: 10, fontWeight: 'bold' }}>
                    Price: ${product.price}
                </Text>
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
                <RenderProduct product={product} />
            </ScrollView>
        );
    }
}

export default connect(mapStateToProps)(ProductDetail);
