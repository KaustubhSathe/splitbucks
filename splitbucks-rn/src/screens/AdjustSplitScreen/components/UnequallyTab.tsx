import AsyncStorage from "@react-native-async-storage/async-storage";
import CheckBox from "@react-native-community/checkbox";
import { useState, useEffect } from "react";
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { GetMembers } from "../../../api/group";
import { RootParamList, Split, User } from "../../../types/types";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export function UnequallyTab({
    groupPK,
    selectedMembers,
    totalAmount,
    setSplit,
    paidBy,
    split,
    setSplitType,
    setSplitMembers
}: {
    groupPK: string,
    selectedMembers: User[],
    totalAmount: number,
    setSplit: React.Dispatch<React.SetStateAction<Split>>,
    paidBy: User,
    split: Split,
    setSplitType: React.Dispatch<React.SetStateAction<string>>,
    setSplitMembers: React.Dispatch<React.SetStateAction<User[]>>
}) {
    const [members, setMembers] = useState<User[]>([]);
    const [loggedInUser, setLoggedInUser] = useState<User>();
    const [membersContribution, setMembersContribution] = useState<number[]>(Array(members.length).fill(0.0));
    const amountContributed = membersContribution.reduce((prev, curr) => prev + curr, 0.0);
    const amountLeft = totalAmount - amountContributed
    const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();

    useEffect(() => {
        AsyncStorage.getItem('user').then(user => JSON.parse(user)).then((user: User) => {
            setLoggedInUser(user)
            if (groupPK) {
                GetMembers(groupPK).then(res => {
                    setMembersContribution(Array([...res, ...members.filter(x => x?.PK !== user?.PK)].length).fill(0.0))
                    setMembers([...res, ...members.filter(x => x?.PK !== user?.PK)])
                }
                )
            }
            if (selectedMembers) {
                setMembers([user, ...selectedMembers])
                setMembersContribution(Array([user, ...selectedMembers].length).fill(0.0))
            }
        })
    }, [])

    return (
        <View style={{ flex: 1, flexDirection: 'column' }}>
            <Text className="ml-auto mr-auto mt-2 font-semibold text-base text-slate-500" style={{ flexBasis: '5%' }}>Select which people owe an equal share.</Text>
            <ScrollView style={{ flexBasis: '80%' }}>
                {members.map((x, i) => <View key={x.PK} className="flex-row justify-between p-4 ">
                    <View className="flex-row">
                        <Image source={{ uri: x.Picture }} width={40} height={40} borderRadius={100} />
                        <View className="ml-4">
                            <Text>{x.Name}</Text>
                            <Text>{x.Email}</Text>
                        </View>
                    </View>
                    <TextInput
                        className="mt-auto mb-auto ml-auto border-b-[1px] border-black w-12 bg-slate-300"
                        keyboardType="numeric"
                        value={membersContribution[i] ? membersContribution[i].toString() : "0.0"}
                        onChangeText={(text) => {
                            setMembersContribution(membersContribution.map((k, v) => v === i ? parseFloat(text.replace(/[^0-9]/g, '')) : k))
                        }}
                    />
                </View>
                )}
            </ScrollView>
            <View className="border-t-stone-600 border-t-[1px] flex-row justify-evenly bg-slate-300" style={{ flexBasis: '15%' }}>
                <View className="flex-col mt-auto mb-auto">
                    <Text className="mt-auto mb-auto">({amountContributed} of {totalAmount})</Text>
                    <Text className="mt-auto mb-auto">{amountLeft} {amountLeft > 0 ? 'left' : 'over'}</Text>
                </View>
                <TouchableOpacity onPress={() => {
                    const ss: Split = {};
                    membersContribution.forEach((contribution, i) => {
                        if (members[i].PK !== paidBy.PK) {
                            if (!ss[`${members[i].PK}:${paidBy.SK}`]) {
                                ss[`${members[i].PK}:${paidBy.SK}`] = 0.0
                            }
                            ss[`${members[i].PK}:${paidBy.SK}`] += contribution;
                        }
                    })
                    setSplit(ss)
                    setSplitType("UNEQUALLY")
                    setSplitMembers(members)
                    navigation.goBack()
                }} className="mt-auto mb-auto w-16 h-10 bg-orange-500 flex justify-center rounded-2xl" >
                    <Text className="text-white font-semibold text-base ml-auto mr-auto">Done</Text>
                </TouchableOpacity>
            </View>
        </View >
    )
}