import { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { FriendListScreenProps, RootParamList, User, WhoPaidScreenProps } from "../../types/types";
import { GetMembers } from "../../api/group";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from '@expo/vector-icons';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export function WhoPaidScreen() {
    const route = useRoute<WhoPaidScreenProps['route']>();
    const paidBy = route.params.expensePaidBy
    const setPaidBy = route.params.setExpensePaidBy
    const [members, setMembers] = useState<User[]>([]);
    const [loggedInUser, setLoggedInUser] = useState<User>();
    const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
    const groupPK = route.params?.groupPK;
    const selectedMembers = route.params?.selectedMembers;
    
    useEffect(() => {
        AsyncStorage.getItem('user').then(user => JSON.parse(user)).then((user: User) => {
            setLoggedInUser(user)
            if (groupPK) {
                GetMembers(groupPK).then(res => setMembers([...res, ...members.filter(x => x?.PK !== user?.PK)]))
            }
            if (selectedMembers) {
                setMembers([user, ...selectedMembers])
            }
        })
    }, [])

    return <View>
        {members.map(x => <TouchableOpacity key={x.PK} className="flex-row justify-start p-4" onPress={() => {
            setPaidBy(x)
            navigation.navigate("AddExpenseScreen")
        }}>
            <Image source={{ uri: x.Picture }} width={40} height={40} borderRadius={100} />
            <View className="ml-4">
                <Text>{x.Name}</Text>
                <Text>{x.Email}</Text>
            </View>
            {x.PK === paidBy.PK ? <Feather style={{ marginBottom: 'auto', marginLeft: 'auto', marginTop: 'auto' }} name="check" size={24} color="black" /> : null}
        </TouchableOpacity>
        )}
    </View>
}