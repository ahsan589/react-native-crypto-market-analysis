import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
    title: string;
    onPress: () => void;
}

export default function MyButton({title, onPress} : Props){
    return(
        <View>
            <TouchableOpacity activeOpacity={0.7} style={styles.button} onPress={onPress}>
                <Text style={styles.text}>{title}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    button:{
        backgroundColor:"black",
        paddingVertical:15,
        maxWidth:"auto",
        paddingHorizontal:50,
        borderRadius:10,
        alignItems:"center"
    },
    text:{
        fontSize:16,
        color:"#fff",
        fontWeight:"bold"
    }
})