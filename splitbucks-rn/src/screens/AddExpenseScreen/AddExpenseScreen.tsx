import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import DatePicker from "react-native-date-picker";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../lib/redux/store";
import { GetUserGroups } from "../../api/group";
import { setValue as setUserGroups } from '../../lib/redux/groupsSlice'
import { setValue as setFriends } from '../../lib/redux/friendsSlice'
import { RadioButtonProps, RadioGroup } from "react-native-radio-buttons-group";
import { GetFriends } from "../../api/friend";
import CheckBox from "@react-native-community/checkbox";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootParamList, User } from "../../types/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AddExpense } from "../../api/expense";

export function AddExpenseScreen() {
    const dispatch = useDispatch()
    const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
    const [expenseDescription, setExpenseDescription] = useState<string>("");
    const [expenseNote, setExpenseNote] = useState<string>("");
    const [expenseAmount, setExpenseAmount] = useState<string>("");
    const [expenseDate, setExpenseDate] = useState(new Date())
    const [open, setOpen] = useState(false)
    const userGroups = useSelector((root: RootState) => root.groups.value)
    const friends = useSelector((root: RootState) => root.friends.value)
    const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>();
    const [friendsChecked, setFriendsChecked] = useState<boolean[]>(Array<boolean>(friends.length).fill(false));
    const radioButtons: RadioButtonProps[] = userGroups.map(x => ({ id: x.PK, label: x.GroupName, value: x.GroupName }))
    const [loggedInUser, setLoggedInUser] = useState<User>();
    const [expensePaidBy, setExpensePaidBy] = useState<User>(loggedInUser);
    const [expenseSplit, setExpenseSplit] = useState<Map<string, number>>(new Map<string, number>());
    const [expenseSplitType, setExpenseSplitType] = useState<string>("EQUALLY");
    const [expenseSplitMembers, setExpenseSplitMembers] = useState<User[]>();
    const [validation, setValidation] = useState<string>("");
    const expenseType = "GROUP"

    const saveExpense = useCallback(async () => {
        if (expenseDescription.length === 0) {
            setValidation("Description cannot be empty!!")
            setTimeout(() => setValidation(""), 2000)
            return;
        }
        if (!expenseAmount || parseFloat(expenseAmount) == 0.0) {
            setValidation("Amount cannot be empty or zero!!")
            setTimeout(() => setValidation(""), 2000)
            return
        }
        if (!selectedGroupId && !friendsChecked.includes(true)) {
            setValidation("Select atleast a group or a friend to split the amount!!")
            setTimeout(() => setValidation(""), 2000)
            return
        }
        AddExpense(
            expenseDescription,
            parseFloat(expenseAmount),
            "Rs",
            expensePaidBy.PK,
            expenseSplitType,
            expenseSplit,
            expenseDate,
            expenseNote,
            expenseSplitMembers.map(x => x.PK),
            expenseType,
            selectedGroupId,
        ).then(res => console.log("response here s ads a ", res))
    }, [
        expenseDescription,
        expenseAmount,
        expensePaidBy,
        expenseSplitType,
        expenseSplit,
        expenseDate,
        expenseNote,
        expenseSplitMembers,
        expenseType,
        selectedGroupId,
        friendsChecked
    ])

    useEffect(() => {
        GetUserGroups().then(groups => dispatch(setUserGroups(groups)))
        GetFriends().then(friends => dispatch(setFriends(friends)))
        AsyncStorage.getItem('user').then(user => JSON.parse(user)).then((user: User) => {
            setLoggedInUser(user)
            setExpensePaidBy(user)
        })
    }, [])

    return (
        <View className="h-full w-full bg-white">
            <View className="pl-4 pr-4 pt-4 flex-col justify-start">
                <Text className="text-lg font-semibold">With you and:</Text>
                <View className="mt-2 border-[1px]">
                    <Text className="text-lg font-semibold text-slate-500 ml-2">Groups</Text>
                    <RadioGroup
                        radioButtons={radioButtons}
                        onPress={(selectedGroupId) => {
                            setFriendsChecked(friendsChecked.map(x => false))
                            setSelectedGroupId(selectedGroupId)
                        }}
                        selectedId={selectedGroupId}
                        layout="row"
                    />
                    <Text className="text-lg font-semibold text-slate-500 ml-2">Friends</Text>
                    {friends.map((fr, i) => (
                        <View key={fr.PK} className="flex-row justify-start">
                            <CheckBox className="mt-auto mb-auto" disabled={false} value={friendsChecked.at(i)}
                                onValueChange={(newValue) => {
                                    setSelectedGroupId(undefined)
                                    setFriendsChecked(friendsChecked.map((k, v) => v === i ? newValue : k))
                                }} />
                            <Text className="mt-auto mb-auto">{fr.Name}</Text>
                        </View>
                    )
                    )}
                </View>
            </View>
            <View className="p-4">
                <Text className="text-slate-400 text-base font-semibold">Add description</Text>
                <TextInput className="border-b-[1px] w-[70%]" value={expenseDescription} onChangeText={val => setExpenseDescription(val)} />
                <Text className="text-slate-400 text-base font-semibold mt-4">Amount</Text>
                <TextInput className="border-b-[1px] w-[70%]" keyboardType="numeric" value={expenseAmount} onChangeText={(text) => setExpenseAmount(text.replace(/[^0-9]/g, ''))} />
                <View className="flex-row justify-start mt-4">
                    <Text className="text-base font-semibold mt-auto mb-auto">Paid by:</Text>
                    <TouchableOpacity onPress={() => navigation.navigate("WhoPaidScreen", {
                        groupPK: selectedGroupId,
                        selectedMembers: friendsChecked.map((k, v) => k ? friends[v] : null).filter(x => x),
                        expensePaidBy: expensePaidBy,
                        setExpensePaidBy: setExpensePaidBy,
                    })} className="ml-3 mt-auto mb-auto p-2 h-10 border-[1px] border-black flex-row rounded-lg">
                        <Text className="m-auto">{loggedInUser?.PK === expensePaidBy?.PK ? "you" : expensePaidBy?.Name}</Text>
                    </TouchableOpacity>
                    <Text className="text-base font-semibold mt-auto mb-auto ml-3">and split</Text>
                    <TouchableOpacity onPress={() => navigation.navigate("AdjustSplitScreen", {
                        groupPK: selectedGroupId,
                        selectedMembers: friendsChecked.map((k, v) => k ? friends[v] : null).filter(x => x),
                        totalAmount: parseFloat(expenseAmount),
                        setExpenseSplit: setExpenseSplit,
                        expensePaidBy: expensePaidBy,
                        expenseSplit: expenseSplit,
                        setExpenseSplitType: setExpenseSplitType,
                        setExpenseSplitMembers: setExpenseSplitMembers
                    })} className="ml-3 mt-auto mb-auto w-20 h-10 border-[1px] border-black flex-row rounded-lg">
                        <Text className="m-auto">{expenseSplitType}</Text>
                    </TouchableOpacity>
                </View>
                <View className="flex-row mt-4">
                    <Text className="text-base font-semibold mt-auto mb-auto">Expense date:</Text>
                    <TouchableOpacity className="mt-auto mb-auto ml-4 border-[1px] p-2 rounded-lg" onPress={() => setOpen(true)} >
                        <Text>{expenseDate.toLocaleString()}</Text>
                    </TouchableOpacity>
                    <DatePicker
                        modal
                        open={open}
                        date={expenseDate}
                        onDateChange={setExpenseDate}
                        onConfirm={(date) => {
                            setOpen(false)
                            setExpenseDate(date)
                        }}
                        onCancel={() => {
                            setOpen(false)
                        }}
                    />
                </View>
                <View className="flex-row mt-4">
                    <Text className="text-base font-semibold mt-auto mb-auto">Note:</Text>
                    <TextInput className="ml-2 border-b-[1px] w-[80%]" />
                </View>
                <TouchableOpacity onPress={saveExpense} className="mt-6 w-24 h-14 bg-orange-500 flex-row justify-center rounded-full shadow-lg shadow-black">
                    <Text className="mt-auto mb-auto text-base font-semibold text-white">Done</Text>
                </TouchableOpacity>
                {validation && <Text className="mt-4 text-red-500 font-semibold text-base">{validation}</Text>}
            </View>
        </View>
    )
}