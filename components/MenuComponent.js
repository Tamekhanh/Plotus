import React, { Component } from 'react';
import { View, FlatList, Text } from 'react-native';
import { ListItem, Avatar } from 'react-native-elements';
import { connect } from 'react-redux';

const mapStateToProps = state => {
    return {
        products: state.products
    }
}

class Menu extends Component {

    render() {

        const renderMenuItem = ({ item, index }) => {
            return (
                <ListItem key={index} bottomDivider onPress={() => this.props.navigation.navigate('ProductDetail', { productId: item.id })}>
                    <Avatar source={{ uri: item.image }} />
                    <ListItem.Content>
                        <ListItem.Title>{item.name}</ListItem.Title>
                        <ListItem.Subtitle>{item.description}</ListItem.Subtitle>
                    </ListItem.Content>
                    <ListItem.Chevron />
                </ListItem>
            );
        };

        if (this.props.products.isLoading) {
            return (
                <View>
                    <Text>Loading...</Text>
                </View>
            );
        }
        else if (this.props.products.errMess) {
            return (
                <View>
                    <Text>{this.props.products.errMess}</Text>
                </View>
            );
        }
        else {
            return (
                <FlatList
                    data={this.props.products.products}
                    renderItem={renderMenuItem}
                    keyExtractor={item => item.id.toString()}
                />
            );
        }
    }
}

export default connect(mapStateToProps)(Menu);
