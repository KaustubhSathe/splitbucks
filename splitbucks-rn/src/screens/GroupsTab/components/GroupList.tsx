import { useState, useCallback } from "react";
import { ScrollView, RefreshControl } from "react-native";
import { Group } from "../../../types/types";
import { GroupTile } from "./Group";
import { CreateGroupButton } from "./CreateGroupButton";

export function GroupsList({ groups }: { groups: Group[] }) {
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

    return (
        <ScrollView className="w-full h-full" refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
            {groups.map(grp => <GroupTile group={grp} key={grp.SK} />)}
            <CreateGroupButton />
        </ScrollView>
    )
}