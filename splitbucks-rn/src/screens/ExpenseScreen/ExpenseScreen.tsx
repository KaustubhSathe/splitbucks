import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AdjustSplitScreenProps, Comment, Expense, ExpenseScreenProps, RootParamList, User } from "../../types/types";
import { GetMembers } from "../../api/group";
import { CreateComment, DeleteExpense, GetComments } from "../../api/expense";
import { CommentBox } from "./components/Comment";
import { GetFriends } from "../../api/friend";

export function ExpenseScreen() {
    const route = useRoute<ExpenseScreenProps['route']>()
    const user = route.params.user
    const expense = route.params.expense
    const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
    const [membersMap, setMembersMap] = useState<Map<string, User>>();
    const [comment, setComment] = useState<string>("");
    const [comments, setComments] = useState<Comment[]>([]);
    const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);

    const saveComment = useCallback(async () => {
        const cc = await CreateComment(comment, expense?.SK, expense?.SplitMembers, expense?.Description)
        setComment("")
        setComments([...comments, cc])
    }, [comment, expense])

    useEffect(() => {
        if (expense.ExpenseType === "GROUP") {
            GetMembers(expense.GroupID).then(members => setMembersMap(new Map<string, User>(members.map(x => [x?.PK, x]))))
        } else {
            GetFriends().then(friends => {
                const x = new Map<string, User>(friends.map(x => [x?.PK, x]))
                x.set(user.PK, user)
                setMembersMap(x)
            })
        }
        GetComments(expense?.SK).then(comments => {
            setComments(comments.sort((a, b) => new Date(a.CreatedAt).getTime() - new Date(b.CreatedAt).getTime()))
        })
    }, [])

    return <View className="bg-white h-full relative">
        <View className="w-full h-[8%]  flex-row mt-4 pl-4 pr-4 justify-between">
            <TouchableOpacity className="mt-auto mb-auto" onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back-outline" size={28} color="black" />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7} className="ml-auto mr-4 mt-auto mb-auto" onPress={() => setDeleteConfirmation(true)}>
                <AntDesign name="delete" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7} className="mt-auto mb-auto" onPress={() => { }}>
                <Feather name="edit-2" size={24} color="black" />
            </TouchableOpacity>
        </View>
        <View className="bg-slate-300 h-[2px] w-full mb-[2%]" />
        <View className="p-4">
            <Text className="text-2xl font-semibold">{expense?.Description}</Text>
            <Text className="text-base font-normal">{expense?.Currency}.{expense?.Amount}</Text>
            <Text>Added by {expense?.AddedByID === user?.PK ? "you" : expense.AddedByName} on {new Date(expense.CreatedAt).toLocaleDateString()}</Text>
            {
                new Date(expense?.CreatedAt).getTime() === new Date(expense.UpdatedAt).getTime()
                    ? null
                    : <Text>Updated by {expense?.AddedByID === user?.PK ? "you" : expense?.AddedByName} on {new Date(expense.CreatedAt).toLocaleDateString()}</Text>
            }
            <Text>{expense?.PaidById === user?.PK ? "You" : expense.PaidByName} paid {expense?.Currency}.{expense?.Amount}</Text>
            {membersMap && expense?.SplitMembers.map(x => <Text key={x}> - {membersMap?.get(x)?.PK === user?.PK ? "You" : membersMap?.get(x)?.Name} owes {expense?.Split[`${x}:${expense.PaidById}`]}</Text>)}
        </View>
        {comments && comments.length > 0 && <ScrollView className="w-full flex-col h-full pl-4 pr-4">
            <Text className="text-base font-semibold">Comments</Text>
            {comments.map(cc => <CommentBox comment={cc} key={cc?.SK} user={user} />)}
        </ScrollView>}
        <View className="w-full h-[7%] mt-auto bg-slate-200 flex-row justify-evenly">
            <TextInput className="w-[85%] h-[80%] mt-auto mb-auto bg-white rounded-full pl-4" placeholder="Add a comment" value={comment} onChangeText={(newval) => setComment(newval)} />
            <TouchableOpacity className="mt-auto mb-auto" onPress={saveComment}>
                <AntDesign name="arrowright" size={24} color="black" />
            </TouchableOpacity>
        </View>
        {deleteConfirmation && <DeleteConfirmationDialog expense={expense} setDeleteConfirmation={setDeleteConfirmation} />}
    </View >
}

function DeleteConfirmationDialog({ setDeleteConfirmation, expense }: { setDeleteConfirmation: React.Dispatch<React.SetStateAction<boolean>>, expense: Expense }) {
    const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();

    const deleteExpense = useCallback(async () => {
        const res = await DeleteExpense(expense)
        setDeleteConfirmation(false)
        navigation.goBack()
    }, [expense])

    return <>
        <View className="absolute bg-black opacity-70 w-full h-full"></View>
        <View className="h-[30%] w-[80%] absolute top-[35%] left-[10%] bg-white rounded-xl p-6">
            <Text className="font-semibold text-xl">Delete expense?</Text>
            <Text className="text-base mt-4">Are you sure you want to delete this expense? This will remove this expense for ALL people involved, not just you.</Text>
            <View className="flex-row ml-auto mt-auto">
                <TouchableOpacity className="mr-8" onPress={() => setDeleteConfirmation(false)}><Text className="text-green-600 font-semibold">Cancel</Text></TouchableOpacity>
                <TouchableOpacity onPress={deleteExpense}><Text className="text-green-600 font-semibold">OK</Text></TouchableOpacity>
            </View>
        </View>
    </>
}