import { API_DOMAIN } from "@env";

export async function GetFriends(splitbucks_id_token: string) {
    const response = await fetch(`${API_DOMAIN}/api/friend`, {
        method: "GET",
        headers: {
            "splitbucks_id_token": splitbucks_id_token
        }
    })

    return response;
}


export async function AddFriend(splitbucks_id_token: string, email: string, name: string) {
    const response = await fetch(`${API_DOMAIN}/api/friend`, {
        method: "POST",
        headers: {
            "splitbucks_id_token": splitbucks_id_token
        },
        body: JSON.stringify({
            "EmailID": email,
            "PetName": name
        })
    })

    return response;
}