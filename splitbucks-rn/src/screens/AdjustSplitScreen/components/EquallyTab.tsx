import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableHighlight, TouchableOpacity, View } from "react-native";
import { GetMembers } from "../../../api/group";
import { RootParamList, Split, User } from "../../../types/types";
import CheckBox from "@react-native-community/checkbox";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export function EquallyTab({ groupPK,
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
    const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
    const [members, setMembers] = useState<User[]>([]);
    const [loggedInUser, setLoggedInUser] = useState<User>();
    const [membersChecked, setMembersChecked] = useState<boolean[]>(Array(members.length).fill(false));
    const membersIncluded = membersChecked.reduce((prev, curr) => prev + (curr ? 1 : 0), 0);
    const amountPerPerson = isFinite(totalAmount / membersIncluded) ? totalAmount / membersIncluded : 0.0;

    useEffect(() => {
        AsyncStorage.getItem('user').then(user => JSON.parse(user)).then((user: User) => {
            setLoggedInUser(user)
            if (groupPK) {
                GetMembers(groupPK).then(res => {
                    setMembersChecked(Array([...res, ...members.filter(x => x?.PK !== user?.PK)].length).fill(false))
                    setMembers([...res, ...members.filter(x => x?.PK !== user?.PK)])
                }
                )
            }
            if (selectedMembers) {
                setMembers([user, ...selectedMembers])
                setMembersChecked(Array([user, ...selectedMembers].length).fill(false))
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
                    <CheckBox className="mt-auto mb-auto ml-auto" disabled={false}
                        value={membersChecked[i]}
                        onValueChange={(newValue) => {
                            setMembersChecked(membersChecked.map((k, v) => v === i ? newValue : k))
                        }}
                    />
                </View>
                )}
            </ScrollView>
            <View className="border-t-stone-600 border-t-[1px] flex-row justify-evenly bg-slate-300" style={{ flexBasis: '15%' }}>
                <View className="flex-col mt-auto mb-auto">
                    <Text className="mt-auto mb-auto">({amountPerPerson}/person)</Text>
                    <Text className="mt-auto mb-auto">({membersIncluded} people)</Text>
                </View>
                <TouchableOpacity onPress={() => {
                    const ss: Split = {};
                    membersChecked.forEach((included, i) => {
                        if (included) {
                            if (!ss[`${members[i].PK}:${paidBy.SK}`]) {
                                ss[`${members[i].PK}:${paidBy.SK}`] = 0.0
                            }
                            ss[`${members[i].PK}:${paidBy.SK}`] +=  amountPerPerson;
                        }
                    })
                    setSplit(ss)
                    setSplitType("EQUALLY")
                    setSplitMembers(membersChecked.map((k, v) => k ? members[v] : null).filter(x => x ? x : false))
                    navigation.goBack()
                }} className="mt-auto mb-auto w-16 h-10 bg-orange-500 flex justify-center rounded-2xl" >
                    <Text className="text-white font-semibold text-base ml-auto mr-auto">Done</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}