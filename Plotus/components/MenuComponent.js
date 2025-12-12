import React, { Component } from 'react';
import { View, FlatList, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { ListItem, Avatar, SearchBar, Icon, Button, Input } from 'react-native-elements';
import { connect } from 'react-redux';
import { baseUrl } from '../shared/baseUrl';
import { deleteProduct, postProduct } from '../redux/ActionCreator';

const mapStateToProps = state => {
    return {
        products: state.products
    }
}

const mapDispatchToProps = dispatch => ({
    deleteProduct: (productId) => dispatch(deleteProduct(productId)),
    postProduct: (name, description, price, image, category) => dispatch(postProduct(name, description, price, image, category))
})

class Menu extends Component {

    constructor(props) {
        super(props);
        this.state = {
            search: '',
            selectedCategory: 'All',
            showModal: false,
            name: '',
            description: '',
            price: '',
            image: 'images/product/IPhone15Pro.jpg', // Default or placeholder
            category: 'phones'
        };
    }

    toggleModal() {
        this.setState({ showModal: !this.state.showModal });
    }

    resetForm() {
        this.setState({
            name: '',
            description: '',
            price: '',
            image: 'images/product/IPhone15Pro.jpg',
            category: 'phones',
            showModal: false
        });
    }

    handleAddProduct() {
        this.props.postProduct(this.state.name, this.state.description, this.state.price, this.state.image, this.state.category);
        this.resetForm();
    }

    updateSearch = (search) => {
        this.setState({ search });
    };

    render() {

        const renderMenuItem = ({ item, index }) => {
            return (
                <ListItem key={index} bottomDivider onPress={() => this.props.navigation.navigate('ProductDetail', { productId: item.id })}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' , gap: 10, flex: 1}}>
                        <Avatar source={{ uri: item.image.startsWith('http') ? item.image : baseUrl + item.image }} />
                        <ListItem.Content>
                            <ListItem.Title style={{ fontWeight: 'bold' }}>{item.name}</ListItem.Title>
                            <ListItem.Subtitle numberOfLines={1}>{item.description}</ListItem.Subtitle>
                            <ListItem.Subtitle style={{ color: '#512DA8', fontWeight: 'bold' }}>${item.price}</ListItem.Subtitle>
                        </ListItem.Content>
                        <TouchableOpacity onPress={() => {
                            Alert.alert(
                                'Delete Product?',
                                'Are you sure you want to delete ' + item.name + '?',
                                [
                                    { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                                    { text: 'OK', onPress: () => this.props.deleteProduct(item.id) },
                                ],
                                { cancelable: false }
                            );
                        }}>
                            <Icon name='trash-can-outline' type='material-community' color='red' />
                        </TouchableOpacity>
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
                        searchIcon={<Icon name='search' size={24} color='black' />}
                        clearIcon={
                            <Icon
                                name='close'
                                size={24}
                                color='black'
                                onPress={() => this.updateSearch('')}
                            />
                        }
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
                    <TouchableOpacity
                        style={{
                            position: 'absolute',
                            bottom: 20,
                            right: 20,
                            backgroundColor: '#512DA8',
                            width: 60,
                            height: 60,
                            borderRadius: 30,
                            justifyContent: 'center',
                            alignItems: 'center',
                            elevation: 5
                        }}
                        onPress={() => this.toggleModal()}
                    >
                        <Icon name='plus' type='font-awesome' color='white' />
                    </TouchableOpacity>

                    <Modal animationType={"slide"} transparent={false}
                        visible={this.state.showModal}
                        onDismiss={() => this.toggleModal()}
                        onRequestClose={() => this.toggleModal()}>
                        <ScrollView style={{ margin: 20 }}>
                            <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>Add New Product</Text>
                            <Input
                                placeholder='Product Name'
                                leftIcon={<Icon type='font-awesome' name='tag' size={24} color='black' />}
                                onChangeText={(name) => this.setState({ name })}
                                value={this.state.name}
                            />
                            <Input
                                placeholder='Description'
                                leftIcon={<Icon type='font-awesome' name='info' size={24} color='black' />}
                                onChangeText={(description) => this.setState({ description })}
                                value={this.state.description}
                            />
                            <Input
                                placeholder='Price'
                                leftIcon={<Icon type='font-awesome' name='dollar' size={24} color='black' />}
                                onChangeText={(price) => this.setState({ price })}
                                value={this.state.price}
                                keyboardType='numeric'
                            />
                            <Text style={{ marginLeft: 10, fontSize: 16, fontWeight: 'bold', color: 'gray' }}>Select Category:</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 10 }}>
                                {['phones', 'laptops', 'accessories', 'tablets', 'gaming', 'cameras', 'home', 'wearables', 'drones'].map((cat, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => this.setState({ category: cat })}
                                        style={{
                                            backgroundColor: this.state.category === cat ? '#512DA8' : 'white',
                                            borderColor: '#512DA8',
                                            borderWidth: 1,
                                            borderRadius: 20,
                                            paddingHorizontal: 15,
                                            paddingVertical: 8,
                                            marginRight: 10
                                        }}
                                    >
                                        <Text style={{ color: this.state.category === cat ? 'white' : '#512DA8' }}>{cat}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                            <Input
                                placeholder='Image URL (relative or absolute)'
                                leftIcon={<Icon type='font-awesome' name='image' size={24} color='black' />}
                                onChangeText={(image) => this.setState({ image })}
                                value={this.state.image}
                            />
                            <View style={{ margin: 10 }}>
                                <Button
                                    onPress={() => this.handleAddProduct()}
                                    color="#512DA8"
                                    title="Add Product"
                                />
                            </View>
                            <View style={{ margin: 10 }}>
                                <Button
                                    onPress={() => this.toggleModal()}
                                    buttonStyle={{ backgroundColor: '#808080' }}
                                    title="Cancel"
                                />
                            </View>
                        </ScrollView>
                    </Modal>
                </View>
            );
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Menu);
