import React, { Component } from 'react';
import { View, Text, StyleSheet, Alert, Platform, Modal, ScrollView } from 'react-native';
import { Card, Icon, Button } from 'react-native-elements';
import * as Calendar from 'expo-calendar';
import * as Notifications from 'expo-notifications';

class Notification extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            hidePast: false
        };
    }

    async obtainCalendarPermission() {
        const { status } = await Calendar.requestCalendarPermissionsAsync();
        if (status === 'granted') {
            return true;
        }
        return false;
    }

    async obtainNotificationPermission() {
        const { status } = await Notifications.requestPermissionsAsync();
        return status === 'granted';
    }

    async addNotificationToCalendar(notification) {
        const hasCalendarPermission = await this.obtainCalendarPermission();
        const hasNotificationPermission = await this.obtainNotificationPermission();

        if (hasCalendarPermission && hasNotificationPermission) {
            try {
                let defaultCalendarId;
                
                if (Platform.OS === 'ios') {
                    const defaultCalendar = await Calendar.getDefaultCalendarAsync();
                    defaultCalendarId = defaultCalendar.id;
                } else {
                    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
                    const writableCalendar = calendars.find(c => c.accessLevel === Calendar.CalendarAccessLevel.OWNER || c.accessLevel === Calendar.CalendarAccessLevel.CONTRIBUTOR);
                    
                    if (writableCalendar) {
                        defaultCalendarId = writableCalendar.id;
                    } else {
                        Alert.alert('Error', 'No writable calendar found.');
                        return;
                    }
                }

                const startDate = new Date(notification.date);
                const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration

                await Calendar.createEventAsync(defaultCalendarId, {
                    title: notification.title,
                    startDate: startDate,
                    endDate: endDate,
                    timeZone: 'Asia/Ho_Chi_Minh',
                    location: 'Office',
                    notes: notification.message
                });

                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: notification.title,
                        body: notification.message,
                        sound: true
                    },
                    trigger: startDate.getTime() > Date.now() ? { date: startDate } : null
                });

                Alert.alert('Success', 'Notification added to your calendar');
            } catch (error) {
                Alert.alert('Error', 'Could not add to calendar: ' + error.message);
            }
        } else {
            Alert.alert('Permission not granted', 'You need to grant calendar and notification permissions to use this feature.');
        }
    }

    render() {
        const notifications = this.props.notifications || [];
        const { showModal, hidePast } = this.state;

        // Sort notifications by date (upcoming first)
        const sortedNotifications = [...notifications].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Filter for dashboard: Show 3 upcoming events
        const now = new Date();
        const upcomingNotifications = sortedNotifications.filter(item => new Date(item.date) >= now);
        const dashboardList = upcomingNotifications.slice(0, 3);

        // Filter for Modal List
        let modalList = sortedNotifications;
        if (hidePast) {
            modalList = modalList.filter(item => new Date(item.date) >= now);
        }

        const renderNotificationItem = (item) => (
            <View key={item.id} style={styles.notificationRow}>
                <Icon name={item.read ? 'envelope-open-o' : 'envelope'} type='font-awesome' color='#512DA8' size={20} />
                <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle}>{item.title}</Text>
                    <Text style={styles.notificationMessage}>{item.message}</Text>
                    <Text style={styles.notificationDate}>{new Date(item.date).toLocaleDateString()}</Text>
                </View>
                <Button
                    icon={<Icon name='calendar-plus-o' type='font-awesome' color='white' size={15} />}
                    buttonStyle={styles.calendarButton}
                    onPress={() => this.addNotificationToCalendar(item)}
                />
            </View>
        );

        return (
            <View>
                <Card>
                    <Card.Title>Upcoming Events</Card.Title>
                    <Card.Divider />
                    {dashboardList.length > 0 ? (
                        dashboardList.map(renderNotificationItem)
                    ) : (
                        <Text>No upcoming events.</Text>
                    )}
                    
                    <View style={styles.buttonContainer}>
                        <Button
                            title="Show All Notifications"
                            type="clear"
                            titleStyle={{ color: '#512DA8' }}
                            onPress={() => this.setState({ showModal: true })}
                        />
                    </View>
                </Card>

                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={showModal}
                    onRequestClose={() => this.setState({ showModal: false })}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>All Notifications</Text>
                            <Button
                                icon={<Icon name='close' type='font-awesome' color='black' />}
                                type="clear"
                                onPress={() => this.setState({ showModal: false })}
                            />
                        </View>
                        
                        <View style={styles.filterContainer}>
                            <Button
                                title={hidePast ? "Show Past Events" : "Hide Past Events"}
                                type="outline"
                                buttonStyle={styles.filterButton}
                                titleStyle={{ color: '#512DA8' }}
                                onPress={() => this.setState({ hidePast: !this.state.hidePast })}
                            />
                        </View>

                        <ScrollView style={styles.modalBody}>
                            {modalList.length > 0 ? (
                                modalList.map(renderNotificationItem)
                            ) : (
                                <Text style={{textAlign: 'center', marginTop: 20}}>No notifications found.</Text>
                            )}
                        </ScrollView>
                    </View>
                </Modal>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    notificationRow: {
        flexDirection: 'row',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        alignItems: 'center'
    },
    notificationContent: {
        marginLeft: 10,
        flex: 1
    },
    notificationTitle: {
        fontWeight: 'bold',
        fontSize: 14,
        color: '#333'
    },
    notificationMessage: {
        fontSize: 13,
        color: '#666',
        marginTop: 2
    },
    notificationDate: {
        fontSize: 11,
        color: '#999',
        marginTop: 4
    },
    calendarButton: {
        backgroundColor: '#512DA8',
        padding: 5,
        marginLeft: 5,
        borderRadius: 5,
        width: 40,
        height: 40
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: Platform.OS === 'ios' ? 40 : 20
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd'
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#512DA8'
    },
    filterContainer: {
        padding: 10,
        alignItems: 'flex-end'
    },
    filterButton: {
        borderColor: '#512DA8',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 15
    },
    modalBody: {
        paddingHorizontal: 10
    }
});


export default Notification;
