import React, { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import DatePicker from "react-native-date-picker";

export function AddExpenseScreen() {
    const [description, setDescription] = useState<string>("");
    const [amount, setAmount] = useState<string>("");
    const [date, setDate] = useState(new Date())
    const [open, setOpen] = useState(false)

    return (
        <View className="h-full w-full bg-white">
            <View className="pl-4 pr-4 pt-4 h-[30%] flex-col justify-start ">
                <Text className="text-lg font-semibold">With you and:</Text>
                <ScrollView className="max-h-[70%] mt-2">
                    <Text>Group 1</Text>
                    <Text>Group 1</Text>
                    <Text>Group 1</Text>
                    <Text>Group 1</Text>
                    <Text>Group 1</Text>
                    <Text>Group 1</Text>
                    <Text>Group 1</Text>
                    <Text>Group 1</Text>
                </ScrollView>
            </View>
            <View className="p-4">
                <Text className="text-slate-400 text-base font-semibold">Add description</Text>
                <TextInput className="border-b-[1px] w-[70%]" value={description} onChangeText={val => setDescription(val)} />
                <Text className="text-slate-400 text-base font-semibold mt-4">Amount</Text>
                <TextInput className="border-b-[1px] w-[70%]" keyboardType="numeric" value={amount.toString()} onChangeText={(text) => setAmount(text.replace(/[^0-9]/g, ''))} />
                <View className="flex-row justify-start mt-4">
                    <Text className="text-base font-semibold mt-auto mb-auto">Paid by:</Text>
                    <TouchableOpacity className="ml-3 mt-auto mb-auto w-10 h-10 border-[1px] border-black flex-row rounded-lg">
                        <Text className="m-auto">you</Text>
                    </TouchableOpacity>
                    <Text className="text-base font-semibold mt-auto mb-auto ml-3">and split</Text>
                    <TouchableOpacity className="ml-3 mt-auto mb-auto w-20 h-10 border-[1px] border-black flex-row rounded-lg">
                        <Text className="m-auto">equally</Text>
                    </TouchableOpacity>
                </View>
                <View className="flex-row mt-4">
                    <Text className="text-base font-semibold mt-auto mb-auto">Expense date:</Text>
                    <TouchableOpacity className="mt-auto mb-auto ml-4 border-[1px] p-2 rounded-lg" onPress={() => setOpen(true)} >
                        <Text>{date.toLocaleString()}</Text>
                    </TouchableOpacity>
                    <DatePicker
                        modal
                        open={open}
                        date={date}
                        onDateChange={setDate}
                        onConfirm={(date) => {
                            setOpen(false)
                            setDate(date)
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
                <TouchableOpacity className="mt-6 w-24 h-14 bg-orange-500 flex-row justify-center rounded-full shadow-lg shadow-black">
                    <Text className="mt-auto mb-auto text-base font-semibold text-white">Done</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}