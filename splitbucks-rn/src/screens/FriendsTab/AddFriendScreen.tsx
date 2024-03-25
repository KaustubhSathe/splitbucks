import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useState } from "react";
import { Pressable, Text, TextInput, TouchableOpacity, View } from "react-native";
import { AddFriend } from "../../api/friend";

export function AddFriendScreen() {
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [changesSaved, setChangesSaved] = useState<boolean>(false);


    const validateEmail = (email: string) => {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    };

    const addFriend = useCallback(async () => {
        if (!validateEmail(email)) {
            setEmail("Please enter valid email!!")
            return
        }

        const idToken = await AsyncStorage.getItem('idToken')
        if (idToken !== null) {
            const res = await AddFriend(idToken, email, name)
            if (res.status === 200) {
                setEmail("")
                setName("")
                setChangesSaved(true)
                setTimeout(() => {
                    setChangesSaved(false)
                }, 3000)
            }
        }
    }, [email, name])

    return (
        <View className="p-4">
            <View className="mb-4">
                <Text className="mt-auto mb-auto">Name</Text>
                <TextInput className="border-b-[1px]" onChangeText={text => setName(text)} value={name} />
            </View>
            <View className="mb-4">
                <Text className="mt-auto mb-auto">Email</Text>
                <TextInput className="border-b-[1px]" onChangeText={text => setEmail(text)} value={email} />
            </View>
            <TouchableOpacity activeOpacity={0.7} className="mt-4 bg-orange-500 w-28 h-10 flex justify-center rounded-lg shadow-lg shadow-orange-700" onPress={addFriend}>
                <Text className="text-base font-semibold text-white ml-auto mr-auto">Add Friend</Text>
            </TouchableOpacity>
            <Text className="mt-4 mb-auto text-center">These people will be notified you have added them as friend. You can start adding expenses right away.</Text>
            {changesSaved && <Text className="mt-6 text-green-600 font-semibold text-lg">Friend added successfully!!</Text>}
        </View>
    )
}
