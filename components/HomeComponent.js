import React, { Component } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Card } from 'react-native-elements';
import { connect } from 'react-redux';
import { fetchProducts, fetchPromotions, fetchPartners } from '../redux/ActionCreator';

const mapStateToProps = state => {
    return {
        products: state.products,
        promotions: state.promotions,
        partners: state.partners
    }
}

const mapDispatchToProps = dispatch => ({
    fetchProducts: () => dispatch(fetchProducts()),
    fetchPromotions: () => dispatch(fetchPromotions()),
    fetchPartners: () => dispatch(fetchPartners())
})

function RenderItem(props) {
    const item = props.item;

    if (props.isLoading) {
        return (
            <Card>
                <Card.Title>Loading...</Card.Title>
            </Card>
        );
    }
    else if (props.errMess) {
        return (
            <Card>
                <Card.Title>{props.errMess}</Card.Title>
            </Card>
        );
    }
    else {
        if (item != null) {
            return (
                <Card>
                    <Card.Title>{item.name}</Card.Title>
                    <Card.Divider />
                    <Card.Image source={{ uri: item.image }} />
                    <Text style={{ margin: 10 }}>
                        {item.description}
                    </Text>
                </Card>
            );
        }
        else {
            return (<View></View>);
        }
    }
}

class Home extends Component {

    componentDidMount() {
        this.props.fetchProducts();
        this.props.fetchPromotions();
        this.props.fetchPartners();
    }

    render() {
        return (
            <ScrollView>
                <RenderItem item={this.props.products.products.filter((product) => product.featured)[0]}
                    isLoading={this.props.products.isLoading}
                    errMess={this.props.products.errMess} />
                <RenderItem item={this.props.promotions.promotions.filter((promo) => promo.featured)[0]}
                    isLoading={this.props.promotions.isLoading}
                    errMess={this.props.promotions.errMess} />
                <RenderItem item={this.props.partners.partners.filter((partner) => partner.featured)[0]}
                    isLoading={this.props.partners.isLoading}
                    errMess={this.props.partners.errMess} />
            </ScrollView>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
