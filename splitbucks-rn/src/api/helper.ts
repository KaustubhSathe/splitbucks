import { API_DOMAIN } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

export async function RetryHelper<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
    let count = 5
    while(count--) {
        const idToken = await AsyncStorage.getItem('idToken')
        init = {
            ...init, 
            headers: {
                ...init.headers, 
                "splitbucks_id_token": idToken
            }
        }
        const response = await fetch(input, init)
        if (response.status === 200) {
            return await response.json();
        } else if (response.status === 401) {
            const userInfo = await GoogleSignin.signInSilently()
            await AsyncStorage.setItem('idToken', userInfo.idToken as string)
        }
    }
}
