import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  FlatList,
  Vibration
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { CheckBox } from 'react-native-elements';
import * as Haptics from 'expo-haptics';

export default function CartScannerComponent({ onScanned, onClose, visible, products }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [facing, setFacing] = useState('back');
  const [manualVisible, setManualVisible] = useState(false);
  const [manualValue, setManualValue] = useState('');
  const [continuousScan, setContinuousScan] = useState(false);
  const [scannedItems, setScannedItems] = useState([]);

  useEffect(() => {
    if (visible) {
        setScanned(false);
        setScannedItems([]);
    }
  }, [visible]);

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            We need your permission to show the camera
          </Text>
          <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
            <Text style={styles.permissionBtnText}>Grant permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.permissionBtnOutline} onPress={onClose}>
            <Text style={styles.permissionBtnOutlineText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    
    if (continuousScan) {
        const scannedData = data.trim();
        const product = products?.find(p => p.id.toString() === scannedData || p.serialNumber === scannedData);
        
        if (product) {
            setScannedItems(prev => [{ ...product, scanId: Date.now() }, ...prev]);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Vibration.vibrate(100);
        }
        
        onScanned({ type, data, continuous: true });
        
        // Reset scanned after delay to allow next scan
        setTimeout(() => {
            setScanned(false);
        }, 1500);
    } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Vibration.vibrate(100);
        onScanned({ type, data, continuous: false });
    }
  };

  const submitManual = () => {
    if (!manualValue.trim()) return;
    setManualVisible(false);
    setScanned(true);
    
    if (continuousScan) {
         const scannedData = manualValue.trim();
         const product = products?.find(p => p.id.toString() === scannedData || p.serialNumber === scannedData);
         if (product) {
             setScannedItems(prev => [{ ...product, scanId: Date.now() }, ...prev]);
             Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
             Vibration.vibrate(100);
         }
         onScanned({ type: 'manual', data: manualValue.trim(), continuous: true });
         setTimeout(() => {
             setScanned(false);
         }, 1500);
    } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Vibration.vibrate(100);
        onScanned({ type: 'manual', data: manualValue.trim(), continuous: false });
    }
    setManualValue('');
  };

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={styles.container}>
        {/* AppBar */}
        <View style={styles.appBar}>
          <Text style={styles.appBarTitle}>Scan Code</Text>
          <View style={styles.appBarActions}>
            <TouchableOpacity onPress={() => setManualVisible(true)} style={styles.iconBtn}>
              <Ionicons name="keypad-outline" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setTorchOn(!torchOn)} style={styles.iconBtn}>
              <Ionicons
                name={torchOn ? 'flash' : 'flash-off'}
                size={24}
                color="white"
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                setFacing((prev) => (prev === 'back' ? 'front' : 'back'))
              }
              style={styles.iconBtn}
            >
              <Ionicons name="camera-reverse" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <CameraView
          style={styles.camera}
          facing={facing}
          enableTorch={torchOn}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['ean13', 'ean8', 'upc_e', 'code128', 'code39', 'pdf417'],
          }}
        >
          <View style={styles.overlay}>
            <View style={styles.scanFrame}>
                <View style={styles.scanLine} />
            </View>
            
            {scannedItems.length > 0 && (
                <View style={styles.historyContainer}>
                    <FlatList
                        data={scannedItems}
                        keyExtractor={item => item.scanId.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.productCard}>
                                <View style={styles.productInfo}>
                                    <Text style={styles.productName}>{item.name}</Text>
                                    <Text style={styles.productDetail}>ID: {item.id}</Text>
                                    <Text style={styles.productDetail}>Barcode: {item.serialNumber || 'N/A'}</Text>
                                </View>
                                <View style={styles.plusOneBadge}>
                                    <Text style={styles.plusOneText}>+1</Text>
                                </View>
                            </View>
                        )}
                        style={styles.historyList}
                        contentContainerStyle={{ paddingBottom: 10 }}
                    />
                </View>
            )}
          </View>

          <View style={styles.bottomControls}>
             <CheckBox
                title='Continuous Scan'
                checked={continuousScan}
                onPress={() => setContinuousScan(!continuousScan)}
                containerStyle={styles.checkboxContainer}
                textStyle={styles.checkboxText}
                checkedColor='#4ade80'
             />
          
            <View style={styles.bottomHint}>
                <Text style={styles.hintText}>
                Place the barcode in the slot to scan.
                </Text>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </CameraView>

        {/* Manual input modal */}
        <Modal visible={manualVisible} transparent animationType="fade">
          <View style={styles.manualOverlay}>
            <View style={styles.manualBox}>
              <Text style={styles.manualTitle}>Enter code manually</Text>
              <TextInput
                value={manualValue}
                onChangeText={setManualValue}
                placeholder="Enter barcode"
                style={styles.manualInput}
                keyboardType="numeric"
                autoFocus
              />
              <View style={styles.manualActions}>
                <TouchableOpacity
                  style={styles.manualCancel}
                  onPress={() => setManualVisible(false)}
                >
                  <Text>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.manualOk} onPress={submitManual}>
                  <Text style={{ fontWeight: '600' }}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },

  appBar: {
    height: 56,
    backgroundColor: '#111',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  appBarTitle: { color: 'white', fontSize: 18, fontWeight: '600' },
  appBarActions: { flexDirection: 'row' },
  iconBtn: { marginLeft: 12 },

  camera: { flex: 1 },

  overlay: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 80 },
  scanFrame: {
    width: 250,
    height: 125,
    borderWidth: 2,
    borderColor: '#4ade80',
    borderRadius: 12,
    marginBottom: 20,
  },
  scanLine: {
    width: '100%',
    height: 2,
    backgroundColor: 'red',
    position: 'absolute',
    top: '50%',
  },
  
  historyContainer: {
    position: 'absolute',
    top: '40%',
    width: '100%',
    height: '45%',
    alignItems: 'center',
  },
  historyList: {
    width: '100%',
  },
  productCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    width: '85%',
    alignSelf: 'center',
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  productDetail: {
    fontSize: 14,
    color: '#666',
  },
  plusOneBadge: {
    backgroundColor: '#4ade80',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  plusOneText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },

  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    width: '100%'
  },
  
  checkboxContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    marginBottom: 10,
  },
  checkboxText: {
    color: 'white',
    fontWeight: 'bold'
  },

  bottomHint: {
    marginBottom: 15,
  },
  hintText: { color: 'white', fontSize: 16 },

  closeBtn: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  closeText: { color: 'black', fontWeight: '600' },

  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionText: { textAlign: 'center', marginBottom: 20 },
  permissionBtn: {
    backgroundColor: '#4ade80',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  permissionBtnText: { fontWeight: '600' },
  permissionBtnOutline: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },

  manualOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  manualBox: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  manualTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  manualInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  manualActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  manualCancel: { marginRight: 16, padding: 8 },
  manualOk: { padding: 8 },
});
