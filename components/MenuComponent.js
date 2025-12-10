import React, { Component } from 'react';
import { View, FlatList, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { ListItem, Avatar, SearchBar } from 'react-native-elements';
import { connect } from 'react-redux';

const mapStateToProps = state => {
    return {
        products: state.products
    }
}

class Menu extends Component {

    constructor(props) {
        super(props);
        this.state = {
            search: '',
            selectedCategory: 'All'
        };
    }

    updateSearch = (search) => {
        this.setState({ search });
    };

    render() {

        const renderMenuItem = ({ item, index }) => {
            return (
                <ListItem key={index} bottomDivider onPress={() => this.props.navigation.navigate('ProductDetail', { productId: item.id })}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' , gap: 10}}>
                        <Avatar source={item.image} />
                        <ListItem.Content>
                            <ListItem.Title style={{ fontWeight: 'bold' }}>{item.name}</ListItem.Title>
                            <ListItem.Subtitle>{item.description}</ListItem.Subtitle>
                            <ListItem.Subtitle style={{ color: '#512DA8', fontWeight: 'bold' }}>${item.price}</ListItem.Subtitle>
                        </ListItem.Content>
                        <ListItem.Chevron />
                    </View>
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
            // Get unique categories
            const categories = ['All', ...new Set(this.props.products.products.map(p => p.category))];

            // Filter products
            const filteredProducts = this.props.products.products.filter(item => {
                const matchesSearch = item.name.toLowerCase().includes(this.state.search.toLowerCase());
                const matchesCategory = this.state.selectedCategory === 'All' || item.category === this.state.selectedCategory;
                return matchesSearch && matchesCategory;
            });

            return (
                <View style={{ flex: 1 }}>
                    <SearchBar
                        placeholder="Search Here..."
                        onChangeText={this.updateSearch}
                        value={this.state.search}
                        lightTheme
                        round
                        containerStyle={{ backgroundColor: 'white', borderBottomColor: 'transparent', borderTopColor: 'transparent' }}
                        inputContainerStyle={{ backgroundColor: '#f2f2f2' }}
                    />
                    <View style={{ height: 50 }}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 10, alignItems: 'center' }}>
                            {categories.map((category, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => this.setState({ selectedCategory: category })}
                                    style={{
                                        backgroundColor: this.state.selectedCategory === category ? '#512DA8' : 'white',
                                        borderColor: '#512DA8',
                                        borderWidth: 1,
                                        borderRadius: 20,
                                        paddingHorizontal: 15,
                                        paddingVertical: 8,
                                        marginRight: 10,
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Text style={{
                                        color: this.state.selectedCategory === category ? 'white' : '#512DA8',
                                        fontSize: 12,
                                        fontWeight: 'bold'
                                    }}>
                                        {category.toUpperCase()}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                    <FlatList
                        data={filteredProducts}
                        renderItem={renderMenuItem}
                        keyExtractor={item => item.id.toString()}
                    />
                </View>
            );
        }
    }
}

export default connect(mapStateToProps)(Menu);
