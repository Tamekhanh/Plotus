import React, { Component } from 'react';
import { View, FlatList, Text } from 'react-native';
import { ListItem, Card } from 'react-native-elements';
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

    componentDidMount() {
        this.props.fetchOrders();
    }

    render() {

        const renderOrderItem = ({ item, index }) => {
            return (
                <Card key={index}>
                    <Card.Title>Order ID: {item.id}</Card.Title>
                    <Card.Divider />
                    <Text style={{ margin: 10 }}>Date: {new Date(item.date).toLocaleString()}</Text>
                    <Text style={{ margin: 10, fontWeight: 'bold' }}>Total: ${item.total}</Text>
                    <Card.Divider />
                    <Text style={{ margin: 10, fontWeight: 'bold' }}>Items:</Text>
                    {item.items.map((product, i) => (
                        <ListItem key={i} bottomDivider>
                            <ListItem.Content>
                                <ListItem.Title>{product.name}</ListItem.Title>
                                <ListItem.Subtitle>Qty: {product.quantity} x ${product.price}</ListItem.Subtitle>
                            </ListItem.Content>
                        </ListItem>
                    ))}
                </Card>
            );
        };

        if (this.props.orders.isLoading) {
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
            return (
                <FlatList
                    data={this.props.orders.orders}
                    renderItem={renderOrderItem}
                    keyExtractor={item => item.id.toString()}
                />
            );
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Order);
