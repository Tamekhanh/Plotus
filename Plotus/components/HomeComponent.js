import React, { Component } from 'react';
import { View, Text, ScrollView, StyleSheet, FlatList } from 'react-native';
import { Card, Button, Icon, ListItem } from 'react-native-elements';
import { connect } from 'react-redux';
import { fetchProducts, fetchPromotions, fetchPartners, fetchOrders, fetchNotifications } from '../redux/ActionCreator';
import { baseUrl } from '../shared/baseUrl';
import Notification from './NotificationComponent';

const mapStateToProps = state => {
    return {
        products: state.products,
        promotions: state.promotions,
        partners: state.partners,
        orders: state.orders,
        notifications: state.notifications
    }
}

const mapDispatchToProps = dispatch => ({
    fetchProducts: () => dispatch(fetchProducts()),
    fetchPromotions: () => dispatch(fetchPromotions()),
    fetchPartners: () => dispatch(fetchPartners()),
    fetchOrders: () => dispatch(fetchOrders()),
    fetchNotifications: () => dispatch(fetchNotifications())
})







class Home extends Component {

    componentDidMount() {
        this.props.fetchProducts();
        this.props.fetchPromotions();
        this.props.fetchPartners();
        this.props.fetchOrders();
        this.props.fetchNotifications();
    }

    render() {
        // Sales by Shift (Today's Sales)
        const today = new Date().toISOString().split('T')[0];
        const todayOrders = this.props.orders.orders.filter(order => 
            order.date && order.date.startsWith(today)
        );
        const todaySales = todayOrders.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);

        // Best Selling Products
        const productSales = {};
        this.props.orders.orders.forEach(order => {
            if (order.items) {
                order.items.forEach(item => {
                    if (productSales[item.name]) {
                        productSales[item.name] += item.quantity;
                    } else {
                        productSales[item.name] = item.quantity;
                    }
                });
            }
        });
        const sortedProducts = Object.entries(productSales)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        // Notifications
        const notifications = this.props.notifications.notifications;

        return (
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.headerContainer}>
                    <Text style={styles.headerText}>Sales Dashboard</Text>
                </View>
                
                <View style={styles.gridContainer}>
                    <View style={styles.gridItem}>
                        <Button
                            title="New Order"
                            icon={<Icon name='cart-plus' type='font-awesome' color='white' size={40} />}
                            buttonStyle={styles.button}
                            titleStyle={styles.buttonTitle}
                            onPress={() => this.props.navigation.navigate('Cart')}
                        />
                    </View>
                    <View style={styles.gridItem}>
                        <Button
                            title="Products"
                            icon={<Icon name='list' type='font-awesome' color='white' size={40} />}
                            buttonStyle={styles.button}
                            titleStyle={styles.buttonTitle}
                            onPress={() => this.props.navigation.navigate('Menu')}
                        />
                    </View>
                    <View style={styles.gridItem}>
                        <Button
                            title="History"
                            icon={<Icon name='history' type='font-awesome' color='white' size={40} />}
                            buttonStyle={styles.button}
                            titleStyle={styles.buttonTitle}
                            onPress={() => this.props.navigation.navigate('Order')}
                        />
                    </View>
                    <View style={styles.gridItem}>
                        <Button
                            title="Partners"
                            icon={<Icon name='users' type='font-awesome' color='white' size={40} />}
                            buttonStyle={styles.button}
                            titleStyle={styles.buttonTitle}
                            onPress={() => this.props.navigation.navigate('Partner')}
                        />
                    </View>
                </View>

                {/* Sales by Shift */}
                <Card>
                    <Card.Title>Sales by Shift (Today)</Card.Title>
                    <Card.Divider/>
                    <View style={styles.statsRow}>
                        <Text style={styles.statsLabel}>Total Sales:</Text>
                        <Text style={styles.statsValue}>${todaySales.toFixed(2)}</Text>
                    </View>
                    <View style={styles.statsRow}>
                        <Text style={styles.statsLabel}>Orders Count:</Text>
                        <Text style={styles.statsValue}>{todayOrders.length}</Text>
                    </View>
                </Card>

                {/* Best Selling Products */}
                <Card>
                    <Card.Title>Best Selling Products</Card.Title>
                    <Card.Divider/>
                    {sortedProducts.length > 0 ? (
                        sortedProducts.map((item, index) => (
                            <View key={index} style={styles.bestSellerRow}>
                                <Text style={styles.productName}>{index + 1}. {item[0]}</Text>
                                <Text style={styles.productQty}>{item[1]} sold</Text>
                            </View>
                        ))
                    ) : (
                        <Text>No sales data available.</Text>
                    )}
                </Card>

                {/* Internal Notifications */}
                <Notification notifications={notifications} />

                <Card>
                    <Card.Title>Quick Stats</Card.Title>
                    <Card.Divider/>
                    <View style={styles.statsRow}>
                        <Text>Total Products:</Text>
                        <Text style={{fontWeight: 'bold'}}>{this.props.products.products.length}</Text>
                    </View>
                    <View style={styles.statsRow}>
                        <Text>Total Partners:</Text>
                        <Text style={{fontWeight: 'bold'}}>{this.props.partners.partners.length}</Text>
                    </View>
                </Card>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: 20,
        backgroundColor: '#f5f5f5',
        flexGrow: 1
    },
    headerContainer: {
        padding: 20,
        backgroundColor: '#fff',
        marginBottom: 10,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd'
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#512DA8'
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        padding: 5
    },
    gridItem: {
        width: '45%',
        margin: 5
    },
    button: {
        backgroundColor: '#512DA8',
        height: 120,
        flexDirection: 'column',
        justifyContent: 'center',
        borderRadius: 10,
        elevation: 5
    },
    buttonTitle: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: 'bold'
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 5,
        alignItems: 'center'
    },
    statsLabel: {
        fontSize: 16,
        color: '#666'
    },
    statsValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333'
    },
    bestSellerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    productName: {
        fontSize: 14,
        color: '#333',
        flex: 1
    },
    productQty: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#512DA8'
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);
