import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-gesture-handler";
import { View } from "react-native-reanimated/lib/typescript/Animated";
import { Image } from "react-native-svg";

const create_profilecard = () =>{
    return(
        <View style={styles.card}>
            <Image source={{url: "https://randomuser.me/api/portraits/men/75.jpg"}} style={StyleSheet.avatar}/>
            <Text style={styles.name}>Shivam</Text>
            <Text style={styles.bio}>Full</Text>
            <TouchableOpacity style={styles.button}>
                <Text style={style.buttonText}></Text>
            </TouchableOpacity>
        </View>
    );
}

export default create_profilecard()
const styles = StyleSheet.create({
    card:{
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        alignItems:'center',
        elevation: 5,
        shadowColor: '#000',


    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 15,
    },
    name:{
        fontSize:22,
        fontWeight: 'bold',
        color: '#333',
    },
    bio:{
        fontSize: 14,
        color: '#666',
        marginVertical: 10,

    },
    button:{
        backgroundColor: '#006bff',
        paddingVertical:10,
        paddingHorizontal: 20,
        borderRadius: 25,
        marginTop: 10,
    }
})