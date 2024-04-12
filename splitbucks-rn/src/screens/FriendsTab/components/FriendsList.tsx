import { RefreshControl, ScrollView, View } from "react-native";
import { User } from "../../../types/types";
import { Friend } from "./Friend";
import { AddFriendButton } from "./AddFriendButton";
import { useState, useCallback, useEffect } from "react";
import { Authenticate } from "../../../api/profile";

export function FriendsList({ friends }: { friends: User[] }) {
    const [refreshing, setRefreshing] = useState(false);
    const [user, setUser] = useState<User>();

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

    useEffect(() => {
        Authenticate().then(user => setUser(user))
    },[refreshing])

    return (
        <ScrollView className="w=full h-full" refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
            {friends && friends.map(fr => <Friend friend={fr} key={fr.PK} user={user}/>)}
            <AddFriendButton />
        </ScrollView>
    )
}