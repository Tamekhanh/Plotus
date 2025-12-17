import React, { Component } from 'react';
import { View, FlatList, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, Alert, RefreshControl } from 'react-native';
import { ListItem, Avatar, SearchBar, Icon, Button, Input, CheckBox } from 'react-native-elements';
import { connect } from 'react-redux';
import { baseUrl, imageUrl } from '../shared/baseUrl';
import { deleteProduct, postProduct, updateProduct, fetchProducts } from '../redux/ActionCreator';


const mapStateToProps = state => {
    return {
        products: state.products
    }
}

const mapDispatchToProps = dispatch => ({
    deleteProduct: (productId) => dispatch(deleteProduct(productId)),
    postProduct: (name, description, price, imageId, category, brand) => dispatch(postProduct(name, description, price, imageId, category, brand)),
    updateProduct: (productId, name, description, price, imageId, category, brand) => dispatch(updateProduct(productId, name, description, price, imageId, category, brand)),
    fetchProducts: () => dispatch(fetchProducts())
})

class Menu extends Component {

    constructor(props) {
        super(props);
        this.state = {
            search: '',
            selectedBrands: [],
            selectedCategories: [],
            showModal: false,
            showFilterModal: false,
            name: '',
            description: '',
            price: '',
            imageId: 0, // Default or placeholder
            category: 'phones',
            brand: 'Apple',
            isEditing: false,
            editingId: null
        };
    }

    toggleModal() {
        this.setState({ showModal: !this.state.showModal });
    }

    toggleFilterModal() {
        this.setState({ showFilterModal: !this.state.showFilterModal });
    }

    resetForm() {
        this.setState({
            name: '',
            description: '',
            price: '',
            imageId: 0,
            category: 'phones',
            brand: 'Apple',
            showModal: false,
            isEditing: false,
            editingId: null
        });
    }

    handleSubmitProduct() {
        if (this.state.isEditing) {
            this.props.updateProduct(this.state.editingId, this.state.name, this.state.description, this.state.price, this.state.imageId, this.state.category, this.state.brand);
        } else {
            this.props.postProduct(this.state.name, this.state.description, this.state.price, this.state.imageId, this.state.category, this.state.brand);
        }
        this.resetForm();
    }

    openEditModal(item) {
        this.setState({
            name: item.name,
            description: item.description,
            price: item.price.toString(),
            imageId: item.imageId,
            category: item.category,
            brand: item.brand || '',
            showModal: true,
            isEditing: true,
            editingId: item.id
        });
    }

    updateSearch = (search) => {
        this.setState({ search });
    };

    toggleBrandSelection(brand) {
        const { selectedBrands } = this.state;
        if (selectedBrands.includes(brand)) {
            this.setState({ selectedBrands: selectedBrands.filter(b => b !== brand) });
        } else {
            this.setState({ selectedBrands: [...selectedBrands, brand] });
        }
    }

    toggleCategorySelection(category) {
        const { selectedCategories } = this.state;
        if (selectedCategories.includes(category)) {
            this.setState({ selectedCategories: selectedCategories.filter(c => c !== category) });
        } else {
            this.setState({ selectedCategories: [...selectedCategories, category] });
        }
    }

    render() {

        const renderMenuItem = ({ item, index }) => {
            return (
                <ListItem key={index} bottomDivider 
                    onPress={() => this.props.navigation.navigate('ProductDetail', { productId: item.id })}
                    onLongPress={() => this.openEditModal(item)}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center' , gap: 10, flex: 1}}>
                        <Avatar source={{ uri: imageUrl + item.imageId + '.jpg' }} />
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

        if (this.props.products.isLoading && this.props.products.products.length === 0) {
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
            // Get unique brands and categories
            const brands = [...new Set(this.props.products.products.map(p => p.brand).filter(b => b))];
            const categories = [...new Set(this.props.products.products.map(p => p.category).filter(c => c))];

            // Filter products
            const filteredProducts = this.props.products.products.filter(item => {
                const matchesSearch = item.name.toLowerCase().includes(this.state.search.toLowerCase());
                const matchesBrand = this.state.selectedBrands.length === 0 || this.state.selectedBrands.includes(item.brand);
                const matchesCategory = this.state.selectedCategories.length === 0 || this.state.selectedCategories.includes(item.category);
                return matchesSearch && matchesBrand && matchesCategory;
            });

            return (
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'white' }}>
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
                        </View>
                        <TouchableOpacity onPress={() => this.toggleFilterModal()} style={{ paddingRight: 10 }}>
                            <Icon name='filter-list' type='material' size={30} color='#512DA8' />
                            {(this.state.selectedBrands.length > 0 || this.state.selectedCategories.length > 0) && (
                                <View style={{
                                    position: 'absolute',
                                    right: 5,
                                    top: -5,
                                    backgroundColor: 'red',
                                    borderRadius: 10,
                                    width: 20,
                                    height: 20,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>
                                    <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                                        {this.state.selectedBrands.length + this.state.selectedCategories.length}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                    
                    <FlatList
                        data={filteredProducts}
                        renderItem={renderMenuItem}
                        keyExtractor={item => item.id.toString()}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.props.products.isLoading}
                                onRefresh={() => this.props.fetchProducts()}
                            />
                        }
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

                    {/* Add/Edit Product Modal */}
                    <Modal animationType={"slide"} transparent={false}
                        visible={this.state.showModal}
                        onDismiss={() => this.toggleModal()}
                        onRequestClose={() => this.toggleModal()}>
                        <ScrollView style={{ margin: 20 }}>
                            <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
                                {this.state.isEditing ? 'Edit Product' : 'Add New Product'}
                            </Text>
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
                            <Input
                                placeholder='Brand'
                                leftIcon={<Icon type='font-awesome' name='briefcase' size={24} color='black' />}
                                onChangeText={(brand) => this.setState({ brand })}
                                value={this.state.brand}
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
                                    onPress={() => this.handleSubmitProduct()}
                                    color="#512DA8"
                                    title={this.state.isEditing ? "Update Product" : "Add Product"}
                                />
                            </View>
                            <View style={{ margin: 10 }}>
                                <Button
                                    onPress={() => this.resetForm()}
                                    buttonStyle={{ backgroundColor: '#808080' }}
                                    title="Cancel"
                                />
                            </View>
                        </ScrollView>
                    </Modal>

                    {/* Filter Modal */}
                    <Modal
                        animationType="fade"
                        transparent={true}
                        visible={this.state.showFilterModal}
                        onRequestClose={() => this.toggleFilterModal()}
                    >
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                            <View style={{ backgroundColor: 'white', width: '80%', borderRadius: 10, padding: 20, maxHeight: '80%' }}>
                                <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' }}>Filter Products</Text>
                                <ScrollView style={{ maxHeight: 400 }}>
                                    <Text style={{ fontSize: 16, fontWeight: 'bold', marginLeft: 10, marginTop: 10, color: '#512DA8' }}>Brands</Text>
                                    {brands.map((brand, index) => (
                                        <CheckBox
                                            key={`brand-${index}`}
                                            title={brand}
                                            checked={this.state.selectedBrands.includes(brand)}
                                            onPress={() => this.toggleBrandSelection(brand)}
                                            containerStyle={{ backgroundColor: 'transparent', borderWidth: 0, padding: 5, marginLeft: 10 }}
                                            checkedColor='#512DA8'
                                        />
                                    ))}
                                    <View style={{ height: 1, backgroundColor: '#e1e1e1', marginVertical: 10 }} />
                                    <Text style={{ fontSize: 16, fontWeight: 'bold', marginLeft: 10, marginTop: 10, color: '#512DA8' }}>Categories</Text>
                                    {categories.map((category, index) => (
                                        <CheckBox
                                            key={`cat-${index}`}
                                            title={category}
                                            checked={this.state.selectedCategories.includes(category)}
                                            onPress={() => this.toggleCategorySelection(category)}
                                            containerStyle={{ backgroundColor: 'transparent', borderWidth: 0, padding: 5, marginLeft: 10 }}
                                            checkedColor='#512DA8'
                                        />
                                    ))}
                                </ScrollView>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 }}>
                                    <Button
                                        title="Clear All"
                                        type="outline"
                                        onPress={() => this.setState({ selectedBrands: [], selectedCategories: [] })}
                                        titleStyle={{ color: '#512DA8' }}
                                        buttonStyle={{ borderColor: '#512DA8', paddingHorizontal: 20 }}
                                    />
                                    <Button
                                        title="Done"
                                        type="solid"
                                        onPress={() => this.toggleFilterModal()}
                                        buttonStyle={{ backgroundColor: '#512DA8', paddingHorizontal: 20 }}
                                    />
                                </View>
                            </View>
                        </View>
                    </Modal>
                </View>
            );
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Menu);
