import React, { Component } from 'react';
import { View, FlatList, Text } from 'react-native';
import { ListItem, Avatar } from 'react-native-elements';
import { connect } from 'react-redux';
import { fetchPartners } from '../redux/ActionCreator';
import { baseUrl, partnerImageUrl } from '../shared/baseUrl';

const mapStateToProps = state => {
    return {
        partners: state.partners
    }
}

const mapDispatchToProps = dispatch => ({
    fetchPartners: () => dispatch(fetchPartners())
})

class Partner extends Component {

    render() {

        const renderPartnerItem = ({ item, index }) => {
            return (
                <ListItem key={index} bottomDivider>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Avatar source={{ uri: partnerImageUrl + item.imageId + '.jpg' }} size="medium" rounded />
                        <ListItem.Content>
                            <ListItem.Title style={{ fontWeight: 'bold' }}>{item.name}</ListItem.Title>
                            <ListItem.Subtitle>{item.description}</ListItem.Subtitle>
                        </ListItem.Content>
                    </View>
                </ListItem>
            );
        };

        if (this.props.partners.isLoading) {
            return (
                <View>
                    <Text>Loading...</Text>
                </View>
            );
        }
        else if (this.props.partners.errMess) {
            return (
                <View>
                    <Text>{this.props.partners.errMess}</Text>
                </View>
            );
        }
        else {
            return (
                <FlatList
                    data={this.props.partners.partners}
                    renderItem={renderPartnerItem}
                    keyExtractor={item => item.id.toString()}
                />
            );
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Partner);
