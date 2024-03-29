import { Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../lib/redux/store";
import { MemberTile } from "./components/MemberTile";
import { FriendListScreenProps, Group, User } from "../../types/types";
import { useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { AddMember, GetMembers, GetUserGroups } from "../../api/group";
import { useEffect } from "react";
import { GetFriends } from "../../api/friend";
import { setValue as setFriends } from '../../lib/redux/friendsSlice'
import { setValue as setGroups } from '../../lib/redux/groupsSlice'

export function FriendListScreen() {
    const route = useRoute<FriendListScreenProps['route']>();
    const groupPK = route.params.groupPK;
    const friends = useSelector((state: RootState) => state.friends.value)
    const groups = useSelector((state: RootState) => state.groups.value)
    const group = groups && groups.filter(x => x.PK === groupPK)[0]
    console.log(group)
    const dispatch = useDispatch()

    useEffect(() => {
        GetFriends().then(friends => dispatch(setFriends(friends)))
        GetUserGroups().then(groups => dispatch(setGroups(groups)))
    }, [])


    return <View>
        <Text className="text-base font-semibold text-slate-500 mt-4 ml-4">Friends on splitbucks</Text>
        {friends.map(x => <MemberTile key={x.PK} member={x} onPress={async () => {
            if (!group?.Members?.includes(x.PK)) {
                const res = await AddMember(group.PK as string, x.PK);
                dispatch(setGroups([...groups.filter(grp => grp.PK !== res.PK), res]))
            }
        }} secondText={group?.Members?.includes(x.PK) ? "Already in group" : ""} />)}
    </View>
}