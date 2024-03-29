import { View, Text, Button, Image } from "react-native";
import { LoginScreenProps, User } from "../../types/types";

import {
    GoogleSignin, GoogleSigninButton,
} from '@react-native-google-signin/google-signin';
import { useEffect } from "react";
import { CLIENT_ID } from '@env'
import { Authenticate } from "../../api/profile";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from "react-redux";
import { setValue as setUser } from "../../lib/redux/userSlice"
import { FontAwesome } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export function LoginScreen({ navigation }: LoginScreenProps) {
    const dispatch = useDispatch()

    useEffect(() => {
        GoogleSignin.configure({
            webClientId: CLIENT_ID,
            offlineAccess: false,
        });

        AsyncStorage.getItem('idToken').then(async res => {
            if (res !== null) {
                AsyncStorage.getItem('user')
                    .then(async user => {
                        if (user !== null) {
                            const user1: User = JSON.parse(user)
                            dispatch(setUser(user1))
                            navigation.reset({
                                index: 0,
                                routes: [{ name: "AppScreen" }],
                            })
                            await SplashScreen.hideAsync();
                        }
                    })
            } else {
                await SplashScreen.hideAsync();
            }
        })
    }, [])

    return (
        <View className="w-full h-full flex-col justify-evenly" >
            <View>
                <FontAwesome name="money" size={144} color="black" style={{
                    marginLeft: 'auto',
                    marginRight: 'auto',
                }} />
                <Text className="text-lg font-semibold m-auto">Splitbucks</Text>
            </View>
            <GoogleSigninButton
                style={{
                    marginLeft: 'auto',
                    marginRight: 'auto'
                }}
                size={GoogleSigninButton.Size.Wide}
                color={GoogleSigninButton.Color.Light}
                onPress={async () => {
                    try {
                        await AsyncStorage.clear()
                        await GoogleSignin.hasPlayServices();
                        const userInfo = await GoogleSignin.signIn();
                        await AsyncStorage.setItem('idToken', userInfo.idToken as string);
                        console.log(userInfo)
                        // Now save this profile in backend and log into app
                        const user: User = await Authenticate()
                        dispatch(setUser(user));
                        navigation.reset({
                            index: 0,
                            routes: [{ name: "AppScreen" }],
                        })
                        await SplashScreen.hideAsync();
                    } catch (error) {
                        console.error(JSON.stringify(error))
                    }
                }} />
        </View>
    )
}




