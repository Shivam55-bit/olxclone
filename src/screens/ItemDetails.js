// src/screens/ItemDetails.js - UPDATED: fetch seller profile from /profile-full and build avatar URL

import React, { useState, useCallback, useMemo, memo, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    FlatList,
    Dimensions,
    Share,
    Alert,
    Platform,
    Modal,
    TouchableWithoutFeedback,
    ActivityIndicator,
    SafeAreaView,
    StatusBar,
    Animated,
    Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useWishlist } from '../WishlistContext';
import api, { BASE_URL } from '../apis/api';
import RazorpayCheckout from 'react-native-razorpay';

const { width, height } = Dimensions.get("window");

// Helper function to get item ID
const getItemId = (item) => item?.id || item?._id || item?.product_id;

// ===============================================================
// ## CONFIG & API FUNCTIONS
// ===============================================================

const API_CONFIG = {
    RAZORPAY_KEY: 'rzp_test_YOUR_ACTUAL_KEY_HERE',
};

const APP_STATUS = {
    IDLE: 'IDLE',
    FETCHING: 'FETCHING',
    INITIATING: 'INITIATING',
    PAYMENT_PENDING: 'PAYMENT_PENDING',
    PROCESSING: 'PROCESSING',
    ERROR: 'ERROR',
};

const createOrderApi = async (productId, amountInPaisa, isBoost = false) => {
    console.log(`[API] Creating ${isBoost ? 'Boost' : 'New'} Order for product: ${productId}`);

    try {
        const response = await api.post('/api/orders/', {
            product_id: productId,
            amount: amountInPaisa / 100,
            is_boost_order: isBoost,
        });

        return response.data;
    } catch (error) {
        console.error("Error in createOrderApi:", error);
        throw error;
    }
};

const verifyPaymentApi = async (orderId, paymentResponse) => {
    try {
        const response = await api.post('/api/orders/verify-payment', {
            order_id: orderId,
            razorpay_payment_id: paymentResponse.razorpay_payment_id,
            razorpay_order_id: paymentResponse.razorpay_order_id,
            razorpay_signature: paymentResponse.razorpay_signature,
        });

        return response.data;
    } catch (error) {
        console.error("Error in verifyPaymentApi:", error);
        throw error;
    }
};

const updateOrderStatusApi = async (orderId, newStatus) => {
    try {
        const response = await api.put(`/api/orders/${orderId}/status`, {
            status: newStatus,
        });

        return response.data;
    } catch (error) {
        console.error("Error in updateOrderStatusApi:", error);
        throw error;
    }
};

// ===============================================================
// ## AD INTERACTION APIs (Like & View)
// ===============================================================

const incrementAdViewApi = async (adId) => {
    try {
        const response = await api.post(`/ads/${adId}/view`);
        return response.data;
    } catch (error) {
        console.error("Error in incrementAdViewApi:", error);
        throw error;
    }
};

const toggleAdLikeApi = async (adId) => {
    try {
        const response = await api.post(`/ads/${adId}/like`);
        return response.data;
    } catch (error) {
        console.error("Error in toggleAdLikeApi:", error);
        throw error;
    }
};

// ===============================================================
// ## Custom Hook: usePaymentFlow
// ===============================================================

const usePaymentFlow = (item) => {
    const [status, setStatus] = useState(APP_STATUS.IDLE);
    const [showModal, setShowModal] = useState(false);
    const [currentAmountInPaisa, setCurrentAmountInPaisa] = useState(0);
    const itemId = String(getItemId(item) || '');

    const getPriceInPaisa = useCallback(() => {
        const cleanPriceString = (item?.price || '0').toString().replace(/[^0-9.]/g, '').replace(/,/g, '');
        const priceInRupees = parseFloat(cleanPriceString) || 0;
        return Math.round(priceInRupees * 100);
    }, [item?.price]);

    const payWithRazorpay = useCallback(async (amountInPaisa, description, isBoost = false) => {
        if (!itemId) {
            Alert.alert("Error", "Cannot process payment: Item ID is missing.");
            setStatus(APP_STATUS.IDLE);
            return;
        }

        setStatus(APP_STATUS.PROCESSING);
        let createdOrderId;

        try {
            const orderCreationResponse = await createOrderApi(itemId, amountInPaisa, isBoost);
            createdOrderId = orderCreationResponse.order_id;

            if (!createdOrderId) throw new Error("Backend did not return an order ID.");

            const options = {
                description: description,
                image: "https://yourlogo.com/logo.png",
                currency: "INR",
                key: API_CONFIG.RAZORPAY_KEY,
                amount: amountInPaisa,
                name: "Bhoomi24",
                order_id: createdOrderId,
                prefill: { email: "user@example.com", contact: "9876543210", name: "User" },
                theme: { color: "#2e7d32" },
            };

            const paymentResponse = await RazorpayCheckout.open(options);
            const verificationResult = await verifyPaymentApi(createdOrderId, paymentResponse);

            if (verificationResult.success) {
                Alert.alert("Success! 🎉", verificationResult.message || (isBoost ? "Ad boosted!" : "Order placed!"));
            } else {
                throw new Error(verificationResult.message || "Payment verification failed.");
            }
        } catch (error) {
            const failureReason = error.description || error.code ? `Code: ${error.code} - ${error.description}` : String(error.message);
            Alert.alert("Payment Failed", failureReason);

            if (createdOrderId) {
                await updateOrderStatusApi(createdOrderId, 'failed').catch(e =>
                    console.error("Failed to update order status:", e.message)
                );
            }
        } finally {
            setStatus(APP_STATUS.IDLE);
        }
    }, [itemId]);

    const selectCOD = useCallback(async () => {
        if (!itemId) {
            Alert.alert("Error", "Cannot place COD order: Item ID is missing.");
            setStatus(APP_STATUS.IDLE);
            return;
        }

        setStatus(APP_STATUS.PROCESSING);
        try {
            const orderCreationResponse = await createOrderApi(itemId, currentAmountInPaisa, false);
            const createdOrderId = orderCreationResponse.order_id;

            if (createdOrderId) {
                Alert.alert("Cash on Delivery", orderCreationResponse.message || "COD order placed!");
            } else {
                throw new Error("Failed to place COD order: No order ID received.");
            }
        } catch (error) {
            Alert.alert("Error", `Failed to place COD order: ${String(error.message)}`);
        } finally {
            setStatus(APP_STATUS.IDLE);
        }
    }, [itemId, currentAmountInPaisa]);

    const payWithSimulatedGateway = useCallback(async (gatewayName, amountInPaisa, description) => {
        if (!itemId) {
            Alert.alert("Error", "Cannot process payment: Item ID is missing.");
            setStatus(APP_STATUS.IDLE);
            return;
        }

        setStatus(APP_STATUS.PROCESSING);
        const amountInRupees = (amountInPaisa / 100).toFixed(2);
        let createdOrderId;

        try {
            const orderCreationResponse = await createOrderApi(itemId, amountInPaisa, false);
            createdOrderId = orderCreationResponse.order_id;

            if (!createdOrderId) throw new Error("Backend did not return an order ID.");

            await new Promise(resolve => setTimeout(resolve, 1500));
            const verificationResult = { success: Math.random() > 0.1, message: "Simulated payment processed." };

            if (verificationResult.success) {
                await updateOrderStatusApi(createdOrderId, 'completed');
                Alert.alert(`${gatewayName} Payment`, `Payment of ₹${amountInRupees} successful!`);
            } else {
                throw new Error(verificationResult.message || "Simulated payment failed.");
            }
        } catch (error) {
            Alert.alert("Error", `Failed to complete transaction: ${String(error.message)}`);
            if (createdOrderId) {
                await updateOrderStatusApi(createdOrderId, 'failed').catch(e =>
                    console.error("Failed to update order status:", e.message)
                );
            }
        } finally {
            setStatus(APP_STATUS.IDLE);
        }
    }, [itemId]);

    const initiateTransaction = useCallback((type) => {
        if (status !== APP_STATUS.IDLE) return;
        setStatus(APP_STATUS.INITIATING);

        const isBoost = type === "boost";
        const finalAmount = isBoost ? 5000 : getPriceInPaisa();

        if (!itemId || finalAmount <= 0) {
            Alert.alert("Error", "Transaction not possible: Invalid data.");
            setStatus(APP_STATUS.IDLE);
            return;
        }

        if (isBoost) {
            payWithRazorpay(finalAmount, "Boost your ad", true);
        } else {
            setCurrentAmountInPaisa(finalAmount);
            setShowModal(true);
            setStatus(APP_STATUS.PAYMENT_PENDING);
        }
    }, [status, itemId, getPriceInPaisa, payWithRazorpay]);

    const handlePaymentMethodSelection = useCallback(async (methodId) => {
        setShowModal(false);
        const description = `Buying ${String(item?.title)}`;

        try {
            switch (methodId) {
                case 'razorpay':
                    await payWithRazorpay(currentAmountInPaisa, description);
                    break;
                case 'stripe':
                    await payWithSimulatedGateway("Stripe", currentAmountInPaisa, description);
                    break;
                case 'paypal':
                    await payWithSimulatedGateway("PayPal", currentAmountInPaisa, description);
                    break;
                case 'cod':
                    await selectCOD();
                    break;
                default:
                    Alert.alert("Error", "Selected payment method is not supported.");
                    setStatus(APP_STATUS.IDLE);
                    break;
            }
        } catch (error) {
            console.error("Payment method selection error:", error);
            setStatus(APP_STATUS.IDLE);
        }
    }, [currentAmountInPaisa, item?.title, payWithRazorpay, payWithSimulatedGateway, selectCOD]);

    const dismissModal = useCallback(() => {
        if (status === APP_STATUS.PAYMENT_PENDING) {
            setStatus(APP_STATUS.IDLE);
        }
        setShowModal(false);
    }, [status]);

    return {
        status,
        showModal,
        currentAmountInPaisa,
        initiateTransaction,
        handlePaymentMethodSelection,
        dismissModal,
    };
};

// ===============================================================
// ## PREMIUM PaymentOptionsBottomSheet with Enhanced Animations
// ===============================================================

const PaymentOptionsBottomSheet = ({ visible, onClose, onSelectPayment, amountInPaisa }) => {
    const slideAnim = useRef(new Animated.Value(height)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 60,
                    friction: 9,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start();

            // Shimmer effect
            Animated.loop(
                Animated.sequence([
                    Animated.timing(shimmerAnim, {
                        toValue: 1,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(shimmerAnim, {
                        toValue: 0,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: height,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                })
            ]).start();
        }
    }, [visible, slideAnim, fadeAnim, shimmerAnim]);

    const paymentMethods = useMemo(() => ([
        {
            id: 'razorpay',
            name: 'Razorpay',
            description: 'UPI, Cards, Netbanking',
            icon: 'wallet-outline',
            iconColor: '#2e7d32',
            gradientColors: ['#E8F5E9', '#C8E6C9'],
            badge: 'POPULAR'
        },
        {
            id: 'stripe',
            name: 'International Cards',
            description: 'Visa, Mastercard, Amex',
            icon: 'card-outline',
            iconColor: '#6772E5',
            gradientColors: ['#EEF0FE', '#DDE1FC']
        },
        {
            id: 'paypal',
            name: 'PayPal',
            description: 'Secure PayPal payments',
            icon: 'logo-paypal',
            iconColor: '#003087',
            gradientColors: ['#F5F9FD', '#E3F2FD']
        },
        {
            id: 'cod',
            name: 'Cash on Delivery',
            description: 'Pay when you receive',
            icon: 'cash-outline',
            iconColor: '#FF6F00',
            gradientColors: ['#FFF3E0', '#FFE0B2']
        },
    ]), []);

    const amountInRupees = useMemo(() => (amountInPaisa / 100).toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
    }), [amountInPaisa]);

    const renderPaymentOption = ({ item, index }) => {
        const scaleAnim = useRef(new Animated.Value(0)).current;
        const bounceAnim = useRef(new Animated.Value(1)).current;

        useEffect(() => {
            if (visible) {
                Animated.sequence([
                    Animated.delay(index * 80),
                    Animated.spring(scaleAnim, {
                        toValue: 1,
                        tension: 100,
                        friction: 8,
                        useNativeDriver: true,
                    }),
                ]).start();
            }
        }, [visible, scaleAnim, index]);

        const handlePressIn = () => {
            Animated.spring(bounceAnim, {
                toValue: 0.95,
                useNativeDriver: true,
            }).start();
        };

        const handlePressOut = () => {
            Animated.spring(bounceAnim, {
                toValue: 1,
                tension: 100,
                friction: 5,
                useNativeDriver: true,
            }).start();
        };

        return (
            <Animated.View style={{
                transform: [
                    { scale: scaleAnim },
                    { scale: bounceAnim }
                ]
            }}>
                <TouchableOpacity
                    style={bottomSheetStyles.optionItem}
                    onPress={() => onSelectPayment(item.id)}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    activeOpacity={1}
                >
                    <LinearGradient
                        colors={item.gradientColors}
                        style={bottomSheetStyles.iconWrapper}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Icon name={item.icon} size={32} color={item.iconColor} />
                    </LinearGradient>

                    <View style={bottomSheetStyles.optionTextContainer}>
                        <View style={bottomSheetStyles.optionNameRow}>
                            <Text style={bottomSheetStyles.optionName}>{item.name}</Text>
                            {item.badge && (
                                <View style={bottomSheetStyles.popularBadge}>
                                    <Text style={bottomSheetStyles.popularBadgeText}>{item.badge}</Text>
                                </View>
                            )}
                        </View>
                        <Text style={bottomSheetStyles.optionDescription}>{item.description}</Text>
                    </View>

                    <View style={bottomSheetStyles.arrowWrapper}>
                        <Icon name="chevron-forward" size={22} color="#666" />
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    const shimmerTranslate = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-100, 100],
    });

    return (
        <Modal
            animationType="none"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <Animated.View style={[bottomSheetStyles.overlay, { opacity: fadeAnim }]}>
                    <TouchableWithoutFeedback>
                        <Animated.View
                            style={[
                                bottomSheetStyles.container,
                                { transform: [{ translateY: slideAnim }] }
                            ]}
                        >
                            <View style={bottomSheetStyles.handleContainer}>
                                <View style={bottomSheetStyles.handle} />
                            </View>

                            <LinearGradient
                                colors={['#1b5e20', '#2e7d32', '#43a047']}
                                style={bottomSheetStyles.header}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Animated.View
                                    style={[
                                        bottomSheetStyles.shimmer,
                                        { transform: [{ translateX: shimmerTranslate }] }
                                    ]}
                                />

                                <View style={bottomSheetStyles.headerContent}>
                                    <View style={bottomSheetStyles.lockIconContainer}>
                                        <Icon name="shield-checkmark" size={24} color="#fff" />
                                    </View>
                                    <Text style={bottomSheetStyles.title}>Select Payment Method</Text>
                                    <Text style={bottomSheetStyles.subtitle}>100% Secure & Encrypted</Text>

                                    <View style={bottomSheetStyles.amountContainer}>
                                        <Text style={bottomSheetStyles.amountLabel}>Amount to Pay</Text>
                                        <Text style={bottomSheetStyles.amountText}>{amountInRupees}</Text>
                                    </View>
                                </View>
                            </LinearGradient>

                            <ScrollView
                                style={bottomSheetStyles.optionsList}
                                showsVerticalScrollIndicator={false}
                            >
                                <FlatList
                                    data={paymentMethods}
                                    keyExtractor={(item) => item.id}
                                    renderItem={renderPaymentOption}
                                    scrollEnabled={false}
                                />

                                <View style={bottomSheetStyles.securityInfo}>
                                    <Icon name="lock-closed" size={16} color="#2e7d32" />
                                    <Text style={bottomSheetStyles.securityText}>
                                        SSL encrypted • PCI DSS compliant • 256-bit security
                                    </Text>
                                </View>
                            </ScrollView>

                            <TouchableOpacity
                                style={bottomSheetStyles.cancelButton}
                                onPress={onClose}
                                activeOpacity={0.8}
                            >
                                <Text style={bottomSheetStyles.cancelButtonText}>Cancel Payment</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </Animated.View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

// ===============================================================
// ## PREMIUM STYLES
// ===============================================================

const bottomSheetStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
    },
    container: {
        backgroundColor: '#fff',
        width: '100%',
        maxHeight: height * 0.85,
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        elevation: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    handleContainer: {
        alignItems: 'center',
        paddingVertical: 14,
    },
    handle: {
        width: 50,
        height: 5,
        backgroundColor: '#e0e0e0',
        borderRadius: 3,
    },
    header: {
        paddingVertical: 30,
        paddingHorizontal: 25,
        alignItems: 'center',
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        position: 'relative',
        overflow: 'hidden',
    },
    shimmer: {
        position: 'absolute',
        top: 0,
        left: -100,
        right: -100,
        height: '100%',
        backgroundColor: 'rgba(255,255,255,0.2)',
        width: 100,
    },
    headerContent: {
        alignItems: 'center',
        zIndex: 1,
    },
    lockIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 26,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 6,
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 13,
        color: '#fff',
        opacity: 0.9,
        marginBottom: 15,
    },
    amountContainer: {
        backgroundColor: 'rgba(255,255,255,0.25)',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
        marginTop: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    amountLabel: {
        fontSize: 13,
        color: '#fff',
        opacity: 0.95,
        textAlign: 'center',
        fontWeight: '600',
    },
    amountText: {
        fontSize: 32,
        fontWeight: '800',
        color: '#fff',
        marginTop: 4,
        textAlign: 'center',
        letterSpacing: 1,
    },
    optionsList: {
        paddingHorizontal: 20,
        paddingTop: 15,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        marginBottom: 14,
        backgroundColor: '#fff',
        borderRadius: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        paddingHorizontal: 14,
        borderWidth: 2,
        borderColor: '#f5f5f5',
    },
    iconWrapper: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        elevation: 2,
    },
    optionTextContainer: {
        flex: 1,
    },
    optionNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    optionName: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1a1a1a',
        marginRight: 8,
    },
    popularBadge: {
        backgroundColor: '#FFD700',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    popularBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 0.5,
    },
    optionDescription: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    arrowWrapper: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    securityInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 25,
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    securityText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 8,
        fontWeight: '600',
    },
    cancelButton: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#e0e0e0',
        borderRadius: 20,
        paddingVertical: 18,
        marginHorizontal: 20,
        marginTop: 10,
        marginBottom: Platform.OS === 'ios' ? 40 : 25,
        alignItems: 'center',
        elevation: 2,
    },
    cancelButtonText: {
        fontSize: 17,
        fontWeight: '800',
        color: '#666',
    },
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    floatingHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        elevation: 15,
    },
    floatingHeaderGradient: {
        paddingHorizontal: 15,
        paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 12 : 42,
        paddingBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    floatingBackButton: {
        padding: 10,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.25)',
    },
    floatingHeaderTitle: {
        fontSize: 19,
        fontWeight: '800',
        color: '#fff',
        flex: 1,
        marginHorizontal: 15,
        letterSpacing: 0.3,
    },
    floatingShareButton: {
        padding: 10,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.25)',
    },
    transparentHeaderButtons: {
        position: 'absolute',
        top: StatusBar.currentHeight ? StatusBar.currentHeight + 15 : 45,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        zIndex: 99,
    },
    circleButton: {
        width: 46,
        height: 46,
        borderRadius: 23,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.35,
        shadowRadius: 5,
    },
    circleButtonGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    carouselContainer: {
        position: 'relative',
    },
    itemImage: {
        width: width,
        height: width * 1.15,
        resizeMode: 'cover',
        backgroundColor: '#e0e0e0',
    },
    imageGradientOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 150,
    },
    dotsWrapper: {
        flexDirection: 'row',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 25,
        left: 0,
        right: 0,
    },
    dot: {
        height: 10,
        borderRadius: 5,
        marginHorizontal: 5,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
    },
    imageCounter: {
        position: 'absolute',
        bottom: 25,
        right: 20,
        borderRadius: 25,
        overflow: 'hidden',
        elevation: 8,
    },
    imageCounterGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    imageCounterText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
        marginLeft: 6,
    },
    priceCardContainer: {
        marginTop: -35,
        paddingHorizontal: 15,
        zIndex: 15,
    },
    priceCard: {
        borderRadius: 25,
        padding: 22,
        elevation: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 18,
    },
    priceLeft: {
        flex: 1,
    },
    priceLabel: {
        fontSize: 15,
        color: '#666',
        marginBottom: 6,
        fontWeight: '600',
    },
    priceWithBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    price: {
        fontSize: 38,
        fontWeight: '900',
        color: '#2e7d32',
        letterSpacing: 0.5,
    },
    bestDealBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 10,
    },
    bestDealText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '800',
        marginLeft: 4,
        letterSpacing: 0.5,
    },
    badgeContainer: {
        marginLeft: 10,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        elevation: 3,
    },
    verifiedText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '800',
        marginLeft: 6,
        letterSpacing: 0.5,
    },
    locationRowAdvanced: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 18,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.08)',
    },
    locationIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        elevation: 2,
    },
    location: {
        fontSize: 15,
        color: '#1a1a1a',
        fontWeight: '700',
        flex: 1,
    },
    divider: {
        width: 1,
        height: 18,
        backgroundColor: '#ccc',
        marginHorizontal: 12,
    },
    timeText: {
        fontSize: 13,
        color: '#666',
        marginLeft: 6,
        fontWeight: '600',
    },
    contentSection: {
        padding: 15,
    },
    titleContainer: {
        marginBottom: 18,
        borderRadius: 20,
        padding: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 5,
    },
    title: {
        fontSize: 26,
        fontWeight: '900',
        color: '#1a1a1a',
        marginBottom: 12,
        lineHeight: 36,
        letterSpacing: 0.3,
    },
    tagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        elevation: 2,
    },
    categoryText: {
        fontSize: 14,
        color: '#2e7d32',
        fontWeight: '700',
        marginLeft: 6,
        letterSpacing: 0.3,
    },
    descriptionCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    sectionHeaderGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        paddingBottom: 12,
        borderBottomWidth: 2,
        borderBottomColor: '#f0f0f0',
    },
    sectionIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1a1a1a',
        letterSpacing: 0.3,
    },
    description: {
        fontSize: 16,
        color: '#555',
        lineHeight: 26,
        fontWeight: '400',
    },
    detailsGrid: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -6,
    },
    gridItem: {
        width: '50%',
        padding: 6,
    },
    gridItemGradient: {
        borderRadius: 16,
        padding: 18,
        alignItems: 'center',
        minHeight: 130,
        justifyContent: 'center',
        elevation: 2,
    },
    gridIconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    gridLabel: {
        fontSize: 13,
        color: '#666',
        marginTop: 8,
        fontWeight: '600',
    },
    gridValue: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1a1a1a',
        marginTop: 4,
    },
    sellerCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },

    // ORIGINAL seller styles (kept for backward compatibility where used)
    sellerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sellerAvatarContainer: {
        position: 'relative',
        marginRight: 15,
    },
    sellerAvatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        borderWidth: 3,
        borderColor: '#fff',
    },
    onlineBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
    },
    onlineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#4CAF50',
    },
    sellerDetails: {
        flex: 1,
    },
    sellerName: {
        fontSize: 19,
        fontWeight: '800',
        color: '#1a1a1a',
        marginBottom: 6,
    },
    sellerStats: {
        marginTop: 4,
    },
    sellerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    sellerBadgeText: {
        fontSize: 12,
        color: '#2e7d32',
        marginLeft: 4,
        fontWeight: '700',
    },
    chatSellerButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        overflow: 'hidden',
        elevation: 5,
    },
    chatSellerGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // NEW / UPDATED seller profile styles
    sellerInfoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    sellerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    sellerAvatarImg: {
        width: 84,
        height: 84,
        borderRadius: 12,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
        elevation: 6,
        backgroundColor: '#e0e0e0',
    },
    verifiedOverlay: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 2,
        elevation: 4,
    },
    sellerMeta: {
        flex: 1,
        justifyContent: 'center',
    },
    sellerMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    sellerMetaText: {
        fontSize: 13,
        color: '#777',
        marginLeft: 6,
    },
    metaDivider: {
        width: 8,
        height: 1,
        backgroundColor: 'transparent',
        marginHorizontal: 8,
    },
    statsRow: {
        flexDirection: 'row',
        marginTop: 10,
    },
    statItem: {
        marginRight: 12,
        alignItems: 'flex-start',
    },
    statValue: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1a1a1a',
    },
    statLabel: {
        fontSize: 12,
        color: '#777',
        marginTop: 2,
        fontWeight: '600',
    },
    sellerActions: {
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
    },
    followButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        borderRadius: 18,
        paddingHorizontal: 14,
        paddingVertical: 8,
        marginBottom: 10,
    },
    following: {
        backgroundColor: '#2e7d32',
    },
    followButtonText: {
        marginLeft: 8,
        fontWeight: '800',
        fontSize: 13,
        color: '#2e7d32',
    },
    messageButton: {
        width: 48,
        height: 48,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 8,
    },
    messageGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Inline expanded profile styles
    sellerExpandedContainer: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    sellerDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    detailLabel: {
        width: 90,
        fontSize: 13,
        color: '#777',
        fontWeight: '700',
    },
    detailText: {
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
    profileButtonsRow: {
        flexDirection: 'row',
        marginTop: 12,
        justifyContent: 'flex-start',
    },
    profileActionButton: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 14,
        marginRight: 10,
        elevation: 2,
    },
    profileActionText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#2e7d32',
    },

    safetyCard: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 15,
        borderWidth: 2,
        borderColor: '#FFE082',
        elevation: 2,
    },
    safetyTips: {
        marginTop: 10,
    },
    safetyTip: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    safetyCheckmark: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    safetyTipText: {
        fontSize: 15,
        color: '#555',
        flex: 1,
        fontWeight: '500',
    },
    bottomActionsContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        elevation: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    bottomActions: {
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.08)',
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    actionButtonAdvanced: {
        width: 56,
        height: 56,
        borderRadius: 28,
        overflow: 'hidden',
        elevation: 6,
    },
    actionButtonActive: {
        elevation: 10,
    },
    actionButtonGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buyNowButton: {
        flex: 1,
        marginHorizontal: 12,
        borderRadius: 28,
        overflow: 'hidden',
        elevation: 8,
    },
    buyNowGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    buyNowText: {
        color: '#fff',
        fontWeight: '900',
        fontSize: 18,
        marginLeft: 10,
        marginRight: 8,
        letterSpacing: 0.5,
    },
    callButtonAdvanced: {
        width: 56,
        height: 56,
        borderRadius: 28,
        overflow: 'hidden',
        elevation: 6,
    },
    chatButtonAdvanced: {
        width: 56,
        height: 56,
        borderRadius: 28,
        overflow: 'hidden',
        elevation: 6,
        marginHorizontal: 8,
    },
    chatButtonGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    chatButtonText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700',
        marginTop: 2,
    },
    securePaymentBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    securePaymentText: {
        fontSize: 11,
        color: '#666',
        marginLeft: 6,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.5,
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
        backgroundColor: '#f8f9fa',
    },
    errorText: {
        fontSize: 22,
        color: '#999',
        marginVertical: 20,
        fontWeight: '600',
    },
    backButton: {
        borderRadius: 30,
        overflow: 'hidden',
        elevation: 6,
        marginTop: 10,
    },
    backButtonGradient: {
        paddingVertical: 14,
        paddingHorizontal: 35,
    },
    backButtonText: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 17,
        letterSpacing: 0.5,
    },
});

// ===============================================================
// ## ImageCarousel (unchanged)
// ===============================================================

const ImageCarousel = memo(({ images }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [pulseAnim]);

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        {
            useNativeDriver: false,
            listener: (event) => {
                const index = Math.round(event.nativeEvent.contentOffset.x / width);
                setActiveIndex(index);
            }
        }
    );

    const renderImage = useCallback(({ item, index }) => {
        const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
        ];

        const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.85, 1, 0.85],
            extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.5, 1, 0.5],
            extrapolate: 'clamp',
        });

        return (
            <Animated.View style={{
                transform: [{ scale }],
                opacity
            }}>
                <Image
                    source={item}
                    style={styles.itemImage}
                    defaultSource={require('../images/user_placeholder.png')}
                    onError={(e) => console.log('Failed to load image:', e.nativeEvent.error)}
                />
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.imageGradientOverlay}
                />
            </Animated.View>
        );
    }, [scrollX]);

    if (!images || images.length === 0) {
        return (
            <Image
                source={require('../images/user_placeholder.png')}
                style={styles.itemImage}
            />
        );
    }

    return (
        <View style={styles.carouselContainer}>
            <Animated.FlatList
                data={images}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                keyExtractor={(item, index) => `image-${index}`}
                renderItem={renderImage}
                decelerationRate="fast"
                snapToInterval={width}
            />

            {images.length > 1 && (
                <View style={styles.dotsWrapper}>
                    {images.map((_, index) => {
                        const inputRange = [
                            (index - 1) * width,
                            index * width,
                            (index + 1) * width,
                        ];

                        const dotWidth = scrollX.interpolate({
                            inputRange,
                            outputRange: [8, 28, 8],
                            extrapolate: 'clamp',
                        });

                        const opacity = scrollX.interpolate({
                            inputRange,
                            outputRange: [0.4, 1, 0.4],
                            extrapolate: 'clamp',
                        });

                        const backgroundColor = scrollX.interpolate({
                            inputRange,
                            outputRange: ['#ffffff80', '#ffffff', '#ffffff80'],
                            extrapolate: 'clamp',
                        });

                        return (
                            <Animated.View
                                key={index}
                                style={[
                                    styles.dot,
                                    {
                                        width: dotWidth,
                                        opacity,
                                        backgroundColor,
                                    }
                                ]}
                            />
                        );
                    })}
                </View>
            )}

            <Animated.View style={[styles.imageCounter, { transform: [{ scale: pulseAnim }] }]}>
                <LinearGradient
                    colors={['rgba(46, 125, 50, 0.95)', 'rgba(27, 94, 32, 0.95)']}
                    style={styles.imageCounterGradient}
                >
                    <Icon name="images" size={16} color="#fff" />
                    <Text style={styles.imageCounterText}>
                        {activeIndex + 1} / {images.length}
                    </Text>
                </LinearGradient>
            </Animated.View>
        </View>
    );
});

// ===============================================================
// ## Main Component: ItemDetails with backend seller avatar usage
// ===============================================================

export default function ItemDetails() {
    const navigation = useNavigation();
    const route = useRoute();
    const { wishlist, toggleWishlist, isInWishlist } = useWishlist();

    const scrollY = useRef(new Animated.Value(0)).current;
    const heartScale = useRef(new Animated.Value(1)).current;
    const heartRotate = useRef(new Animated.Value(0)).current;
    const priceCardScale = useRef(new Animated.Value(0)).current;

    const item = route.params?.item;
    const itemId = getItemId(item);

    // fetch seller profile from backend (prefer backend values like avatar, name, location, verified)
    const [sellerProfile, setSellerProfile] = useState(null);
    const [sellerLoading, setSellerLoading] = useState(false);

    useEffect(() => {
        let mounted = true;
        const fetchSellerProfile = async () => {
            if (!item?.user_id) return;
            setSellerLoading(true);
            try {
                // call profile-full endpoint (matches provided curl)
                const resp = await api.get(`/api/user/${item.user_id}/profile-full`);
                const data = resp?.data ?? null;
                if (!data) {
                    if (mounted) setSellerProfile(null);
                    return;
                }

                // build absolute avatar URL (respect BASE_URL)
                const cleanedBase = (typeof BASE_URL === 'string' && BASE_URL.endsWith('/')) ? BASE_URL.slice(0, -1) : BASE_URL;
                const avatarPath = data.avatar;
                const avatarUrl = avatarPath
                    ? (avatarPath.startsWith('http') ? avatarPath : `${cleanedBase}${avatarPath.startsWith('/') ? avatarPath : '/' + avatarPath}`)
                    : null;

                // normalize response to fields used in component
                const profile = {
                    id: data.id,
                    username: data.username,
                    name: data.full_name || data.username,
                    avatar: avatarUrl,
                    about: data.bio,
                    verified: !!data.is_verified,
                    joined: data.member_since,
                    location: (data.location && (data.location.city || data.location.country))
                        ? `${data.location.city ?? ''}${data.location.city && data.location.country ? ', ' : ''}${data.location.country ?? ''}`
                        : null,
                    followers: data.followers_count ?? 0,
                    total_ads: data.total_ads ?? (Array.isArray(data.ads) ? data.ads.length : 0),
                    raw: data,
                };

                if (mounted) setSellerProfile(profile);
            } catch (err) {
                console.warn('Failed to fetch seller profile', err?.message ?? err);
                if (mounted) setSellerProfile(null);
            } finally {
                if (mounted) setSellerLoading(false);
            }
        };

        fetchSellerProfile();
        return () => { mounted = false; };
    }, [item?.user_id]);

    // Local state for views and likes
    const [viewCount, setViewCount] = useState(item?.views || 0);
    const [likeCount, setLikeCount] = useState(item?.likes || 0);
    const [isLiked, setIsLiked] = useState(false);
    const [isProcessingLike, setIsProcessingLike] = useState(false);

    // NEW: seller follow state & handler for improved seller UI
    const [sellerFollowing, setSellerFollowing] = useState(item?.seller_following || false);
    const [followLoading, setFollowLoading] = useState(false);

    // NEW: inline expanded seller profile toggle
    const [sellerExpanded, setSellerExpanded] = useState(false);

    const {
        status,
        showModal,
        currentAmountInPaisa,
        initiateTransaction,
        handlePaymentMethodSelection,
        dismissModal,
    } = usePaymentFlow(item);

    // Increment view count when component mounts
    useEffect(() => {
        const incrementView = async () => {
            if (!itemId) return;

            try {
                const response = await incrementAdViewApi(itemId);
                if (response?.views !== undefined) {
                    setViewCount(response.views);
                } else {
                    setViewCount(prev => prev + 1);
                }
                console.log(`View count incremented for ad: ${itemId}`);
            } catch (error) {
                console.error('Failed to increment view:', error.message);
            }
        };

        incrementView();
    }, [itemId]);

    useEffect(() => {
        Animated.spring(priceCardScale, {
            toValue: 1,
            tension: 60,
            friction: 7,
            delay: 300,
            useNativeDriver: true,
        }).start();
    }, [priceCardScale]);

    if (!item) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
                <View style={styles.errorContainer}>
                    <Icon name="sad-outline" size={80} color="#ccc" />
                    <Text style={styles.errorText}>Item not found</Text>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <LinearGradient
                            colors={['#2e7d32', '#1b5e20']}
                            style={styles.backButtonGradient}
                        >
                            <Text style={styles.backButtonText}>Go Back</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const isFavourited = isInWishlist(item);

    // Image handling
    const FALLBACK_PATH = 'placeholder.png';
    const rawImages = item.images && item.images.length > 0 ? item.images : (item.image ? [item.image] : []);

    const isValidBaseUrl = typeof BASE_URL === 'string' && BASE_URL.startsWith('http');
    const cleanedBaseUrl = isValidBaseUrl ? (BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL) : '';

    const processedImages = rawImages.map(imagePath => {
        if (typeof imagePath === 'string' && imagePath.startsWith('http')) {
            return { uri: imagePath };
        } else if (typeof imagePath === 'string' && imagePath !== FALLBACK_PATH && cleanedBaseUrl.length > 0) {
            const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
            return { uri: `${cleanedBaseUrl}${path}` };
        }
        return require('../images/user_placeholder.png');
    });

    const displayImages = processedImages.length > 0 ? processedImages : [require('../images/user_placeholder.png')];

    const handleShare = useCallback(async () => {
        try {
            await Share.share({
                message: `Check out ${String(item.title)} for ₹${String(item.price)} on Bhoomi24! 🔥`,
            });
        } catch (error) {
            Alert.alert("Error", String(error.message));
        }
    }, [item.title, item.price]);

    const handleWishlistToggle = useCallback(async () => {
        if (isProcessingLike || !itemId) return;

        setIsProcessingLike(true);

        try {
            // Call API to toggle like
            const response = await toggleAdLikeApi(itemId);

            // Update local state based on API response
            if (response.liked !== undefined) {
                setIsLiked(response.liked);
                setLikeCount(response.likes || likeCount + (response.liked ? 1 : -1));
            } else {
                // Fallback: toggle locally if API doesn't return liked status
                setIsLiked(prev => !prev);
                setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
            }

            // Also toggle wishlist locally
            toggleWishlist(item);

            // Animate heart
            Animated.parallel([
                Animated.sequence([
                    Animated.spring(heartScale, {
                        toValue: 1.4,
                        friction: 3,
                        useNativeDriver: true,
                    }),
                    Animated.spring(heartScale, {
                        toValue: 1,
                        friction: 3,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.sequence([
                    Animated.timing(heartRotate, {
                        toValue: 1,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                    Animated.timing(heartRotate, {
                        toValue: 0,
                        duration: 0,
                        useNativeDriver: true,
                    }),
                ])
            ]).start();

        } catch (error) {
            Alert.alert("Error", `Failed to update like: ${error.message}`);
        } finally {
            setIsProcessingLike(false);
        }
    }, [item, toggleWishlist, itemId, isProcessingLike, isLiked, likeCount, heartScale, heartRotate]);

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 200],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    const headerScale = scrollY.interpolate({
        inputRange: [0, 200],
        outputRange: [0.9, 1],
        extrapolate: 'clamp',
    });

    const priceCardTranslateY = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [0, -50],
        extrapolate: 'clamp',
    });

    const spin = heartRotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const isDisabled = status !== APP_STATUS.IDLE;

    const handleSellerProfileNav = useCallback(() => {
        // Pass seller user_id to SellerProfile screen
        if (item?.user_id) {
            navigation.navigate("SellerProfile", { userId: item.user_id });
        } else {
            Alert.alert("Seller info not available");
        }
    }, [navigation, item?.user_id]);

    const handleFollowSeller = useCallback(async () => {
        if (!item?.user_id || followLoading) return;
        setFollowLoading(true);

        // optimistic UI toggle
        setSellerFollowing(prev => !prev);

        try {
            const action = sellerFollowing ? 'unfollow' : 'follow';
            // adjust endpoint to your backend; this is a common pattern
            await api.post(`/api/user/${item.user_id}/${action}`);
        } catch (err) {
            // revert on error
            setSellerFollowing(prev => !prev);
            console.error('Follow action failed', err);
            Alert.alert('Error', 'Unable to update following status.');
        } finally {
            setFollowLoading(false);
        }
    }, [item?.user_id, sellerFollowing, followLoading]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Floating Header with scale animation */}
            <Animated.View style={[
                styles.floatingHeader,
                {
                    opacity: headerOpacity,
                    transform: [{ scale: headerScale }]
                }
            ]}>
                <LinearGradient
                    colors={['rgba(27, 94, 32, 0.98)', 'rgba(46, 125, 50, 0.98)']}
                    style={styles.floatingHeaderGradient}
                >
                    <TouchableOpacity
                        style={styles.floatingBackButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Icon name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.floatingHeaderTitle} numberOfLines={1}>
                        {item.title}
                    </Text>
                    <TouchableOpacity
                        style={styles.floatingShareButton}
                        onPress={handleShare}
                    >
                        <Icon name="share-social" size={22} color="#fff" />
                    </TouchableOpacity>
                </LinearGradient>
            </Animated.View>

            {/* Transparent Header Buttons */}
            <View style={styles.transparentHeaderButtons}>
                <TouchableOpacity
                    style={styles.circleButton}
                    onPress={() => navigation.goBack()}
                >
                    <LinearGradient
                        colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)']}
                        style={styles.circleButtonGradient}
                    >
                        <Icon name="arrow-back" size={24} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.circleButton}
                    onPress={handleShare}
                >
                    <LinearGradient
                        colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)']}
                        style={styles.circleButtonGradient}
                    >
                        <Icon name="share-social" size={22} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            <Animated.ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
            >
                {/* Image Carousel */}
                <ImageCarousel images={displayImages} />

                {/* Premium Glassmorphism Price Card */}
                <Animated.View style={[
                    styles.priceCardContainer,
                    {
                        transform: [
                            { scale: priceCardScale },
                            { translateY: priceCardTranslateY }
                        ]
                    }
                ]}>
                    <LinearGradient
                        colors={['rgba(255,255,255,0.98)', 'rgba(255,255,255,0.95)']}
                        style={styles.priceCard}
                    >
                        <View style={styles.priceRow}>
                            <View style={styles.priceLeft}>
                                <Text style={styles.priceLabel}>Current Price</Text>
                                <View style={styles.priceWithBadge}>
                                    <Text style={styles.price}>₹{item.price || '0.00'}</Text>
                                    <LinearGradient
                                        colors={['#4CAF50', '#2e7d32']}
                                        style={styles.bestDealBadge}
                                    >
                                        <Icon name="trending-down" size={12} color="#fff" />
                                        <Text style={styles.bestDealText}>BEST DEAL</Text>
                                    </LinearGradient>
                                </View>
                            </View>

                            <View style={styles.badgeContainer}>
                                <LinearGradient
                                    colors={['#FFD700', '#FFA500']}
                                    style={styles.verifiedBadge}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <Icon name="shield-checkmark" size={18} color="#fff" />
                                    <Text style={styles.verifiedText}>VERIFIED</Text>
                                </LinearGradient>
                            </View>
                        </View>

                        <View style={styles.locationRowAdvanced}>
                            <LinearGradient
                                colors={['#E8F5E9', '#C8E6C9']}
                                style={styles.locationIcon}
                            >
                                <Icon name="location" size={18} color="#2e7d32" />
                            </LinearGradient>
                            <Text style={styles.location}>{item.location || 'Unknown'}</Text>
                            <View style={styles.divider} />
                            <Icon name="time" size={16} color="#2e7d32" />
                            <Text style={styles.timeText}>
                                {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recently'}
                            </Text>
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* Title Section with gradient background */}
                <View style={styles.contentSection}>
                    <LinearGradient
                        colors={['#ffffff', '#f8f9fa']}
                        style={styles.titleContainer}
                    >
                        <Text style={styles.title}>{item.title || 'No Title'}</Text>

                        <View style={styles.tagRow}>
                            {item.category && (
                                <LinearGradient
                                    colors={['#E8F5E9', '#C8E6C9']}
                                    style={styles.categoryBadge}
                                >
                                    <Icon name="pricetag" size={14} color="#2e7d32" />
                                    <Text style={styles.categoryText}>{item.category}</Text>
                                </LinearGradient>
                            )}

                            <LinearGradient
                                colors={['#E3F2FD', '#BBDEFB']}
                                style={styles.categoryBadge}
                            >
                                <Icon name="flame" size={14} color="#1976D2" />
                                <Text style={[styles.categoryText, { color: '#1976D2' }]}>HOT</Text>
                            </LinearGradient>
                        </View>
                    </LinearGradient>

                    {/* Description Card with icon */}
                    {item.description && (
                        <View style={styles.descriptionCard}>
                            <LinearGradient
                                colors={['#f8f9fa', '#ffffff']}
                                style={styles.sectionHeaderGradient}
                            >
                                <View style={styles.sectionIconContainer}>
                                    <Icon name="document-text" size={22} color="#2e7d32" />
                                </View>
                                <Text style={styles.sectionTitle}>Description</Text>
                            </LinearGradient>
                            <Text style={styles.description}>{item.description}</Text>
                        </View>
                    )}

                    {/* Enhanced Details Grid */}
                    <View style={styles.detailsGrid}>
                        <LinearGradient
                            colors={['#f8f9fa', '#ffffff']}
                            style={styles.sectionHeaderGradient}
                        >
                            <View style={styles.sectionIconContainer}>
                                <Icon name="information-circle" size={22} color="#2e7d32" />
                            </View>
                            <Text style={styles.sectionTitle}>Product Details</Text>
                        </LinearGradient>

                        <View style={styles.gridContainer}>
                            {item.condition && (
                                <View style={styles.gridItem}>
                                    <LinearGradient
                                        colors={['#E8F5E9', '#F1F8E9']}
                                        style={styles.gridItemGradient}
                                    >
                                        <View style={styles.gridIconCircle}>
                                            <Icon name="checkmark-circle" size={28} color="#2e7d32" />
                                        </View>
                                        <Text style={styles.gridLabel}>Condition</Text>
                                        <Text style={styles.gridValue}>{item.condition}</Text>
                                    </LinearGradient>
                                </View>
                            )}

                            {item.brand && (
                                <View style={styles.gridItem}>
                                    <LinearGradient
                                        colors={['#E3F2FD', '#BBDEFB']}
                                        style={styles.gridItemGradient}
                                    >
                                        <View style={styles.gridIconCircle}>
                                            <Icon name="cube" size={28} color="#1976D2" />
                                        </View>
                                        <Text style={styles.gridLabel}>Brand</Text>
                                        <Text style={styles.gridValue}>{item.brand}</Text>
                                    </LinearGradient>
                                </View>
                            )}

                            <View style={styles.gridItem}>
                                <LinearGradient
                                    colors={['#FFF3E0', '#FFE0B2']}
                                    style={styles.gridItemGradient}
                                >
                                    <View style={styles.gridIconCircle}>
                                        <Icon name="eye" size={28} color="#F57C00" />
                                    </View>
                                    <Text style={styles.gridLabel}>Views</Text>
                                    <Text style={styles.gridValue}>{viewCount}</Text>
                                </LinearGradient>
                            </View>

                            <View style={styles.gridItem}>
                                <LinearGradient
                                    colors={['#FCE4EC', '#F8BBD0']}
                                    style={styles.gridItemGradient}
                                >
                                    <View style={styles.gridIconCircle}>
                                        <Icon name="heart" size={28} color="#C2185B" />
                                    </View>
                                    <Text style={styles.gridLabel}>Likes</Text>
                                    <Text style={styles.gridValue}>{likeCount}</Text>
                                </LinearGradient>
                            </View>
                        </View>
                    </View>

                    {/* Premium Seller Info Card - uses backend sellerProfile if available */}
                    <View style={styles.sellerCard}>
                        <LinearGradient
                            colors={['#f8f9fa', '#ffffff']}
                            style={styles.sectionHeaderGradient}
                        >
                            <View style={styles.sectionIconContainer}>
                                <Icon name="person-circle" size={22} color="#2e7d32" />
                            </View>
                            <Text style={styles.sectionTitle}>Seller Information</Text>
                        </LinearGradient>

                        {/* summary row: toggles expanded profile */}
                        <TouchableOpacity
                            style={styles.sellerInfoCard}
                            onPress={() => setSellerExpanded(prev => !prev)}
                            activeOpacity={0.9}
                        >
                            <View style={styles.sellerLeft}>
                                <View style={{ marginRight: 14, position: 'relative' }}>
                                    {sellerLoading ? (
                                        <View style={[styles.sellerAvatarImg, { justifyContent: 'center', alignItems: 'center' }]}>
                                            <ActivityIndicator size="small" color="#2e7d32" />
                                        </View>
                                    ) : (sellerProfile?.avatar || item.seller_avatar || item.user_avatar) ? (
                                        <Image
                                            source={{ uri: (sellerProfile?.avatar || item.seller_avatar || item.user_avatar) }}
                                            style={styles.sellerAvatarImg}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <LinearGradient
                                            colors={['#2e7d32', '#1b5e20']}
                                            style={styles.sellerAvatarImg}
                                        >
                                            <Icon name="person" size={36} color="#fff" />
                                        </LinearGradient>
                                    )}

                                    {(sellerProfile?.verified ?? item.seller_verified) && (
                                        <View style={styles.verifiedOverlay}>
                                            <Icon name="checkmark-circle" size={16} color="#43a047" />
                                        </View>
                                    )}
                                </View>

                                <View style={styles.sellerMeta}>
                                    <Text style={styles.sellerName}>{sellerProfile?.name || item.seller_name || item.user_name || 'Seller'}</Text>

                                    <View style={styles.sellerMetaRow}>
                                        <Icon name="location" size={14} color="#777" />
                                        <Text style={styles.sellerMetaText}>
                                            {sellerProfile?.location || item.seller_location || item.location || 'Unknown'}
                                        </Text>

                                        <View style={styles.metaDivider} />

                                        {/* <Icon name="time" size={14} color="#777" />
                                        <Text style={styles.sellerMetaText}>
                                            {sellerProfile?.joined ? `Joined ${new Date(sellerProfile.joined).toLocaleDateString?.() ?? sellerProfile.joined}` : (item.seller_joined ? `Joined ${new Date(item.seller_joined).toLocaleDateString()}` : (item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recently'))}
                                        </Text> */}
                                    </View>

                                    <View style={[styles.sellerMetaRow, { marginTop: 10, alignItems: 'flex-start' }]}>
                                        <View style={{ flex: 1 }}>
                                            {/* <Text style={{ fontSize: 14, color: '#333', fontWeight: '700' }}>
                                                Rating: <Text style={{ fontWeight: '900' }}>
                                                    {((sellerProfile?.rating ?? item.seller_rating ?? item.rating ?? 0) !== null && !isNaN(Number(sellerProfile?.rating ?? item.seller_rating ?? item.rating ?? 0)))
                                                        ? Number(sellerProfile?.rating ?? item.seller_rating ?? item.rating ?? 0).toFixed(1)
                                                        : (sellerProfile?.rating ?? item.seller_rating ?? item.rating ?? '0.0')}
                                                </Text> */}
                                            {/* </Text> */}
                                            <Text style={{ fontSize: 13, color: '#666', marginTop: 6 }}>
                                                {sellerProfile?.about ? sellerProfile.about : (item.seller_about ? item.seller_about : (item.seller_description || '').slice(0, 120) || 'No profile description.')}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* <View style={styles.statsRow}>
                                        <View style={styles.statItem}>
                                            <Text style={styles.statValue}>{sellerProfile?.followers ?? item.seller_followers ?? item.seller_followers_count ?? 0}</Text>
                                            <Text style={styles.statLabel}>Followers</Text>
                                        </View>
                                        <View style={styles.statItem}>
                                            <Text style={styles.statValue}>{sellerProfile?.total_ads ?? item.seller_total_ads ?? item.user_ads ?? item.seller_ads ?? 0}</Text>
                                            <Text style={styles.statLabel}>Ads</Text>
                                        </View>
                                    </View> */}
                                </View>
                            </View>

                            <View style={styles.sellerActions}>
                                {/* <TouchableOpacity
                                    style={[styles.followButton, sellerFollowing && styles.following]}
                                    onPress={handleFollowSeller}
                                    disabled={followLoading}
                                    activeOpacity={0.8}
                                >
                                    <Icon name={sellerFollowing ? 'checkmark' : 'person-add'} size={16} color={sellerFollowing ? '#fff' : '#2e7d32'} />
                                    <Text style={[styles.followButtonText, sellerFollowing && { color: '#fff' }]}>
                                        {sellerFollowing ? 'Following' : 'Follow'}
                                    </Text>
                                </TouchableOpacity> */}

                                {/* Chat button removed */}

                                {/* <TouchableOpacity
                                    style={styles.messageButton}
                                    onPress={() => {
                                        const phone = sellerProfile?.phone || item.seller_phone || item.phone;
                                        if (phone) {
                                            Linking.openURL(`tel:${phone}`).catch(() => {
                                                Alert.alert('Error', 'Unable to open dialer.');
                                            });
                                        } else {
                                            Alert.alert('Phone not available');
                                        }
                                    }}
                                    activeOpacity={0.85}
                                >
                                    <LinearGradient colors={['#4CAF50', '#2e7d32']} style={styles.messageGradient}>
                                        <Icon name="call" size={18} color="#fff" />
                                    </LinearGradient>
                                </TouchableOpacity> */}

                                <TouchableOpacity
                                    style={[styles.followButton, { marginTop: 10, paddingHorizontal: 12, borderRadius: 16 }]}
                                    onPress={() => {
                                        navigation.navigate('SellerProfile', {
                                            userId: item.user_id,
                                            seller: {
                                                id: item.user_id,
                                                name: sellerProfile?.name || item.seller_name || item.user_name,
                                                avatar: sellerProfile?.avatar || item.seller_avatar || item.user_avatar,
                                                verified: sellerProfile?.verified ?? item.seller_verified,
                                                phone: sellerProfile?.phone || item.seller_phone || item.phone,
                                                email: sellerProfile?.email || item.seller_email || item.email,
                                                location: sellerProfile?.location || item.seller_location || item.location,
                                                about: sellerProfile?.about || item.seller_about || item.seller_description,
                                                rating: sellerProfile?.rating ?? item.seller_rating ?? item.rating,
                                                followers: sellerProfile?.followers ?? item.seller_followers ?? item.seller_followers_count,
                                                total_ads: sellerProfile?.total_ads ?? item.seller_total_ads ?? item.user_ads ?? item.seller_ads,
                                                joined: sellerProfile?.joined ?? item.seller_joined,
                                            }
                                        });
                                    }}
                                    activeOpacity={0.9}
                                >
                                    <Text style={[styles.followButtonText, { color: '#2e7d32', fontWeight: '900' }]}>View Profile</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>

                        {/* Inline expanded profile content */}
                        {sellerExpanded && (
                            <View style={styles.sellerExpandedContainer}>
                                {/* Phone */}
                                <View style={styles.sellerDetailRow}>
                                    <Text style={styles.detailLabel}>Phone</Text>
                                    <TouchableOpacity
                                        onPress={() => {
                                            const phone = sellerProfile?.phone || item.seller_phone || item.phone;
                                            if (phone) {
                                                Linking.openURL(`tel:${phone}`).catch(() => Alert.alert('Error', 'Unable to open dialer.'));
                                            } else {
                                                Alert.alert('Phone not available');
                                            }
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[styles.detailText, { color: '#2e7d32', fontWeight: '700' }]}>
                                            {sellerProfile?.phone || item.seller_phone || item.phone || 'Not provided'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Email */}
                                <View style={styles.sellerDetailRow}>
                                    <Text style={styles.detailLabel}>Email</Text>
                                    <TouchableOpacity
                                        onPress={() => {
                                            const email = sellerProfile?.email || item.seller_email || item.email;
                                            if (email) {
                                                Linking.openURL(`mailto:${email}`).catch(() => Alert.alert('Error', 'Unable to open mail client.'));
                                            } else {
                                                Alert.alert('Email not available');
                                            }
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.detailText}>
                                            {sellerProfile?.email || item.seller_email || item.email || 'Not provided'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Address / Location */}
                                <View style={styles.sellerDetailRow}>
                                    <Text style={styles.detailLabel}>Address</Text>
                                    <Text style={styles.detailText}>{sellerProfile?.location || item.seller_location || item.location || 'Not provided'}</Text>
                                </View>

                                {/* Joined */}
                                <View style={styles.sellerDetailRow}>
                                    <Text style={styles.detailLabel}>Joined</Text>
                                    <Text style={styles.detailText}>
                                        {sellerProfile?.joined ? new Date(sellerProfile.joined).toLocaleDateString?.() ?? sellerProfile.joined : (item.seller_joined ? new Date(item.seller_joined).toLocaleDateString() : (item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recently'))}
                                    </Text>
                                </View>

                                {/* Full about / description */}
                                <View style={{ marginTop: 8 }}>
                                    <Text style={{ fontSize: 13, color: '#777', marginBottom: 6, fontWeight: '700' }}>About</Text>
                                    <Text style={{ fontSize: 14, color: '#333', lineHeight: 20 }}>
                                        {sellerProfile?.about || item.seller_about || item.seller_description || 'No further details provided by the seller.'}
                                    </Text>
                                </View>

                                {/* Actions: View Profile / See Ads */}
                                <View style={styles.profileButtonsRow}>
                                    <TouchableOpacity
                                        style={styles.profileActionButton}
                                        onPress={() => {
                                            navigation.navigate('SellerProfile', { userId: item.user_id });
                                        }}
                                        activeOpacity={0.85}
                                    >
                                        <Text style={styles.profileActionText}>Full Profile</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.profileActionButton}
                                        onPress={() => {
                                            // navigate to seller's ads list - adjust route name if different
                                            navigation.navigate('SellerProfile', { userId: item.user_id, sellerName: sellerProfile?.name || item.seller_name || item.user_name });
                                        }}
                                        activeOpacity={0.85}
                                    >
                                        <Text style={styles.profileActionText}>See Ads ({sellerProfile?.total_ads ?? item.seller_total_ads ?? item.user_ads ?? item.seller_ads ?? 0})</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Enhanced Safety Tips */}
                    <LinearGradient
                        colors={['#FFF8E1', '#FFECB3']}
                        style={styles.safetyCard}
                    >
                        <View style={styles.sectionHeaderGradient}>
                            <View style={[styles.sectionIconContainer, { backgroundColor: '#FFF3E0' }]}>
                                <Icon name="shield-checkmark" size={22} color="#FF6F00" />
                            </View>
                            <Text style={styles.sectionTitle}>Safety Tips</Text>
                        </View>
                        <View style={styles.safetyTips}>
                            {[
                                'Meet in a safe, public place',
                                'Check the item before you buy',
                                'Pay only after collecting item',
                                'Never share personal banking details'
                            ].map((tip, index) => (
                                <View key={index} style={styles.safetyTip}>
                                    <LinearGradient
                                        colors={['#4CAF50', '#2e7d32']}
                                        style={styles.safetyCheckmark}
                                    >
                                        <Icon name="checkmark" size={14} color="#fff" />
                                    </LinearGradient>
                                    <Text style={styles.safetyTipText}>{tip}</Text>
                                </View>
                            ))}
                        </View>
                    </LinearGradient>
                </View>

                <View style={{ height: 140 }} />
            </Animated.ScrollView>

            {/* PREMIUM Bottom Action Bar */}
            <View style={styles.bottomActionsContainer}>
                <LinearGradient
                    colors={['rgba(255,255,255,0.98)', 'rgba(248,249,250,0.98)']}
                    style={styles.bottomActions}
                >
                    <View style={styles.actionRow}>
                        <Animated.View style={{
                            transform: [
                                { scale: heartScale },
                                { rotate: spin }
                            ]
                        }}>
                            <TouchableOpacity
                                style={[
                                    styles.actionButtonAdvanced,
                                    (isFavourited || isLiked) && styles.actionButtonActive
                                ]}
                                onPress={handleWishlistToggle}
                                disabled={isDisabled || isProcessingLike}
                                activeOpacity={0.7}
                            >
                                <LinearGradient
                                    colors={(isFavourited || isLiked) ? ['#ff1744', '#d50000'] : ['#fff', '#f5f5f5']}
                                    style={styles.actionButtonGradient}
                                >
                                    <Icon
                                        name={(isFavourited || isLiked) ? 'heart' : 'heart-outline'}
                                        size={26}
                                        color={(isFavourited || isLiked) ? '#fff' : '#2e7d32'}
                                    />
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Chat with Seller Button */}
                        <TouchableOpacity
                            style={styles.chatButtonAdvanced}
                            onPress={() => {
                                navigation.navigate('ChatDetail', {
                                    conversationId: `conv_${item.user_id || item.seller_id}`,
                                    receiverId: item.user_id || item.seller_id,
                                    name: sellerProfile?.name || item.seller_name || item.user_name || 'Seller',
                                    avatar: sellerProfile?.avatar || item.seller_avatar || 'https://i.pravatar.cc/150',
                                    online: sellerProfile?.online || false,
                                    productId: item.id,
                                });
                            }}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['#2e7d32', '#43a047']}
                                style={styles.chatButtonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Icon name="chatbubble-ellipses" size={24} color="#fff" />
                                <Text style={styles.chatButtonText}>Chat</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.callButtonAdvanced}
                            onPress={() => {
                                const phone = sellerProfile?.phone || item.seller_phone || item.phone;
                                if (phone) {
                                    Linking.openURL(`tel:${phone}`).catch(() => {
                                        Alert.alert('Error', 'Unable to open dialer.');
                                    });
                                } else {
                                    Alert.alert("Call Seller", "Phone not available");
                                }
                            }}
                            disabled={isDisabled}
                            activeOpacity={0.7}
                        >
                            <LinearGradient
                                colors={['#4CAF50', '#2e7d32']}
                                style={styles.actionButtonGradient}
                            >
                                <Icon name="call" size={24} color="#fff" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.securePaymentBanner}>
                        <Icon name="lock-closed" size={14} color="#2e7d32" />
                        <Text style={styles.securePaymentText}>
                            100% Secure Payment • Buyer Protection Guaranteed
                        </Text>
                    </View>
                </LinearGradient>
            </View>

            <PaymentOptionsBottomSheet
                visible={showModal}
                onClose={dismissModal}
                onSelectPayment={handlePaymentMethodSelection}
                amountInPaisa={currentAmountInPaisa}
            />
        </View>
    );
}