import { API_DOMAIN } from "@env";

export async function CreateGroup(splitbucks_id_token: string, groupName: string) {
    const response = await fetch(`${API_DOMAIN}/api/group`, {
        method: "POST",
        headers: {
            "splitbucks_id_token": splitbucks_id_token
        },
        body: JSON.stringify({
            GroupName: groupName
        })
    })

    return response;
}

export async function GetUserGroups(splitbucks_id_token: string) {
    const response = await fetch(`${API_DOMAIN}/api/user_groups`, {
        method: "GET",
        headers: {
            "splitbucks_id_token": splitbucks_id_token
        }
    })

    return response;
}

export async function GetMembers(splitbucks_id_token: string, group_id: string) {
    const response = await fetch(`${API_DOMAIN}/api/get_members?group_id=${group_id}`, {
        method: "GET",
        headers: {
            "splitbucks_id_token": splitbucks_id_token
        }
    })

    return response;
}