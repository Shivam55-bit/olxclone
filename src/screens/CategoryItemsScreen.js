// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, SafeAreaView, TextInput } from 'react-native';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import { useWishlist } from './WishlistContext'; // Assuming this path is correct
// import LinearGradient from 'react-native-linear-gradient';

// // 🔹 Re-declare dummyItems with categories (Must be accessible here or passed via context/prop)
// const dummyItems = [
//     { _id: '101', title: 'Honda City Car', details: '2020 model, good condition', price: '7,50,000', image: 'https://www.siddeshwaratravels.in/car_images/3.jpg', category: 'Cars' },
//     { _id: '102', title: 'iPhone 13 Pro', details: '128GB, like new', price: '65,000', image: 'https://goldenshield.in/cdn/shop/files/BareNakedforiPhone13ProandiPhone13ProMax-ThinnestCaseforiPhone13ProandiPhone13ProMax-PitchBlack-2_2000x_2a209eaa-1114-4664-8fc6-18aba247eb91.jpg?v=1697537433&width=2048', category: 'Mobiles' },
//     { _id: '103', title: 'Royal Enfield Classic', details: '2019 model, low mileage', price: '1,20,000', image: 'https://etimg.etb2bimg.com/photo/112980378.cms', category: 'Bikes' },
//     { _id: '104', title: 'Samsung LED TV', details: '42 inch, Full HD', price: '22,000', image: 'https://kaydeeelectronics.in/cdn/shop/files/untitled-design-2024-08-05t152903600-66b0a28a46e7c.webp?v=1737196902', category: 'Electronics' },
//     { _id: '105', title: 'Swift Dzire Car', details: '2022 model, very good condition', price: '8,00,000', image: 'https://content.jdmagicbox.com/comp/rajkot/r4/9999px281.x281.180209144422.j1r4/catalogue/maharaja-tours-and-travels-mota-mava-rajkot-car-hire-7f2gq1u8f6.jpg', category: 'Cars' },
//     { _id: '106', title: 'Flat for Sale', details: '2 BHK, prime location', price: '40,00,000', image: 'https://static-n.vn/n/images/listing_2023/2023-11-23/listing/1690072044301552/3b859586144e54823812821c9fa6a84f.jpg', category: 'Properties' },
//     { _id: '107', title: 'Apple Watch Series 8', details: 'GPS + Cellular', price: '35,000', image: 'https://m.media-amazon.com/images/I/71YdE7D+s1L._AC_UF1000,1000_QL80_.jpg', category: 'Electronics' },
//     { _id: '108', title: 'Hero Splendor', details: '2021 model, mileage 65kmpl', price: '55,000', image: 'https://images.hindustantimes.com/auto/img/2023/12/28/1600x900/Hero_Splendor_Plus_XTEC_2023_1688640191771_1703770335805.jpg', category: 'Bikes' },
//     { _id: '109', 'title': 'Samsung Galaxy S21', 'details': '256GB, Phantom Grey', 'price': '32,000', 'image': 'https://m.media-amazon.com/images/I/81k32Gv1T0L._AC_UF1000,1000_QL80_.jpg', 'category': 'Mobiles' },
//     { _id: '110', 'title': 'Luxury Villa', 'details': '4 BHK, private pool', 'price': '2,00,00,000', 'image': 'https://i.pinimg.com/736x/8e/4a/02/8e4a023055375d8d06841753736569ec.jpg', 'category': 'Properties' },
// ];


// export default function CategoryItemsScreen({ route, navigation }) {
//     const { category } = route.params;
//     const { wishlist, toggleWishlist } = useWishlist();

//     const [allCategoryData, setAllCategoryData] = useState([]);
//     const [filteredData, setFilteredData] = useState([]);
//     const [searchQuery, setSearchQuery] = useState('');

//     // --- Core Logic ---

//     // 1. Initial Filtering by Category
//     useEffect(() => {
//         // Initial filter by category
//         const initialResults = dummyItems.filter(item => 
//             category === "All" || item.category === category
//         );
//         setAllCategoryData(initialResults); // Store the initial category-filtered data
//         setFilteredData(initialResults);    // Set the display data
        
//         // Optionally set the screen title
//         navigation.setOptions({ title: category });
//     }, [category, navigation]);

//     // 2. Search Logic
//     useEffect(() => {
//         if (searchQuery.length === 0) {
//             setFilteredData(allCategoryData);
//             return;
//         }

//         const lowerCaseQuery = searchQuery.toLowerCase();
//         const searchResults = allCategoryData.filter(item => 
//             item.title.toLowerCase().includes(lowerCaseQuery) ||
//             item.details.toLowerCase().includes(lowerCaseQuery)
//         );
//         setFilteredData(searchResults);
//     }, [searchQuery, allCategoryData]);


//     // --- UI Components and Handlers ---

//     const handleFilterPress = () => {
//         // TODO: Implement your filter modal or navigation here
//         alert("Filter button pressed! (Implement your filter modal here)");
//     };

//     const renderItem = ({ item }) => (
//         <TouchableOpacity
//             style={styles.card}
//             activeOpacity={0.8}
//             onPress={() => navigation.navigate('ItemDetails', { item })}
//         >
//             <TouchableOpacity
//                 style={styles.likeIcon}
//                 onPress={(e) => {
//                     e.stopPropagation();
//                     toggleWishlist(item);
//                 }}
//             >
//                 <View style={styles.likeIconWrapper}>
//                     <Ionicons
//                         name={wishlist.some((w) => w._id === item._id) ? 'heart' : 'heart-outline'}
//                         size={22}
//                         color={wishlist.some((w) => w._id === item._id) ? 'red' : '#2e7d32'}
//                     />
//                 </View>
//             </TouchableOpacity>

//             <Image source={{ uri: item.image }} style={styles.cardImage} />
//             <Text style={styles.cardTitle}>{item.title}</Text>
//             {item.details ? <Text style={styles.cardDetails}>{item.details}</Text> : null}
//             <Text style={styles.cardPrice}>₹ {item.price}</Text>
//         </TouchableOpacity>
//     );

//     return (
//         <SafeAreaView style={styles.container}>
//             {/* Header with Search and Filter Icon */}
//             <LinearGradient colors={['#2e7d32', '#1b5e20']} style={styles.header}>
//                 <Text style={styles.headerTitle}>{category} ({filteredData.length})</Text>
                
//                 <View style={styles.searchBarContainer}>
//                     {/* Search Input */}
//                     <View style={styles.searchInputWrapper}>
//                         <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
//                         <TextInput
//                             style={styles.searchInput}
//                             placeholder="Search in this category..."
//                             placeholderTextColor="#888"
//                             value={searchQuery}
//                             onChangeText={setSearchQuery}
//                         />
//                     </View>

//                     {/* Filter Icon */}
//                     <TouchableOpacity style={styles.filterButton} onPress={handleFilterPress}>
//                         <Ionicons name="options-outline" size={24} color="#fff" />
//                     </TouchableOpacity>
//                 </View>
//             </LinearGradient>

//             {filteredData.length > 0 ? (
//                 <FlatList
//                     data={filteredData}
//                     keyExtractor={(item) => item._id}
//                     renderItem={renderItem}
//                     numColumns={2}
//                     contentContainerStyle={styles.listContainer}
//                 />
//             ) : (
//                 <View style={styles.emptyContainer}>
//                     <Ionicons name="alert-circle-outline" size={50} color="#999" />
//                     <Text style={styles.emptyText}>
//                         No items found for "{searchQuery}" in the {category} category.
//                     </Text>
//                 </View>
//             )}
//         </SafeAreaView>
//     );
// }

// const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: '#f5f5f5' },
//     // --- Header and Search Styles ---
//     header: {
//         paddingHorizontal: 20,
//         paddingVertical: 15,
//     },
//     headerTitle: {
//         fontSize: 20,
//         fontWeight: 'bold',
//         color: '#fff',
//         marginBottom: 10, // Added space above the search bar
//     },
//     searchBarContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//     },
//     searchInputWrapper: {
//         flex: 1, // Takes up remaining space
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: '#fff',
//         borderRadius: 25,
//         paddingHorizontal: 10,
//         height: 40,
//         marginRight: 10,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 1 },
//         shadowOpacity: 0.2,
//         shadowRadius: 1.41,
//         elevation: 2,
//     },
//     searchIcon: {
//         marginRight: 5,
//     },
//     searchInput: {
//         flex: 1,
//         fontSize: 16,
//         color: '#333',
//         paddingVertical: 0, // Important for Android input height
//     },
//     filterButton: {
//         backgroundColor: '#2e7d32', // Darker green or primary color
//         borderRadius: 25,
//         height: 40,
//         width: 40,
//         justifyContent: 'center',
//         alignItems: 'center',
//         borderWidth: 1,
//         borderColor: '#fff',
//     },
//     // --- Existing Styles (omitted for brevity, but included in final code) ---
//     listContainer: {
//         paddingHorizontal: 5,
//         paddingTop: 10,
//     },
//     card: { 
//         flex: 1, backgroundColor: '#fff', margin: 5, borderRadius: 12, padding: 8, 
//         position: 'relative', elevation: 3, shadowColor: '#000', 
//         shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41,
//     },
//     cardImage: { width: '100%', height: 120, borderRadius: 10 },
//     cardTitle: { fontWeight: '700', marginTop: 8, fontSize: 14, color: '#222' },
//     cardDetails: { fontSize: 12, color: '#666', marginTop: 2 },
//     cardPrice: { fontSize: 15, fontWeight: '600', color: '#2e7d32', marginTop: 4 },
//     likeIcon: { position: 'absolute', top: 10, right: 10, zIndex: 10 },
//     likeIconWrapper: { 
//         backgroundColor: "rgba(255, 255, 255, 0.6)", 
//         borderRadius: 20, 
//         padding: 6, 
//     },
//     emptyContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         padding: 20,
//     },
//     emptyText: {
//         fontSize: 16,
//         color: '#666',
//         marginTop: 10,
//         textAlign: 'center',
//     }
// });