import { Text, View } from "react-native";
import { Comment, User } from "../../../types/types";

export function CommentBox({ comment, user }: { comment: Comment, user: User }) {
    return <View className={comment.AddedByID === user.PK ? 'ml-auto mb-4' : 'mr-auto mb-4'}>
        <View className="flex-row">
            <Text>{comment.AddedByID === user.PK ? 'You' : comment.AddedByName} . </Text>
            <Text>{new Date(comment.CreatedAt).toLocaleDateString()}</Text>
        </View>
        <View className="h-9 p-2 bg-green-500 rounded-lg flex justify-center"><Text className="font-semibold text-black ml-auto mr-auto">{comment.Comment}</Text></View>
    </View>
}