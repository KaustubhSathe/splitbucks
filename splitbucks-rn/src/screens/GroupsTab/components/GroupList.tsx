import { useState, useCallback, useEffect } from "react";
import { ScrollView, RefreshControl } from "react-native";
import { GroupTile } from "./GroupTile";
import { CreateGroupButton } from "./CreateGroupButton";
import { useIsFocused } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import { GetUserGroups } from "../../../api/group";
import { RootState } from "../../../lib/redux/store";
import { setValue as setGroups } from '../../../lib/redux/groupsSlice'
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';


export function GroupsList() {
    const [refreshing, setRefreshing] = useState(false);
    const groups = useSelector((state: RootState) => state.groups.value)
    const dispatch = useDispatch()
    const isFocused = useIsFocused()

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

    useEffect(() => {
        GetUserGroups().then(groups => dispatch(setGroups([...groups.filter(x => x.SK !== "GROUP#NONGROUP"), ...groups.filter(x => x.SK === "GROUP#NONGROUP")])))
    }, [isFocused]);

    return (
        <ScrollView className="w-full h-full" refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
            {groups.map(grp => <GroupTile group={grp} key={uuidv4()} />)}
            <CreateGroupButton />
        </ScrollView>
    )
}