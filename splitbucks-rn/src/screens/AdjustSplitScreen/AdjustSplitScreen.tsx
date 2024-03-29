import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { ByPercentagesTab } from "./components/ByPercentagesTab";
import { EquallyTab } from "./components/EquallyTab";
import { UnequallyTab } from "./components/UnequallyTab";
import { useRoute } from "@react-navigation/native";
import { AdjustSplitScreenProps } from "../../types/types";

const Tab = createMaterialTopTabNavigator();

export function AdjustSplitScreen() {
    const route = useRoute<AdjustSplitScreenProps['route']>();
    const groupPK = route.params.groupPK
    const selectedMembers = route.params.selectedMembers
    const totalAmount = route.params.totalAmount
    const setSplit = route.params.setExpenseSplit
    const paidBy = route.params.expensePaidBy
    const split = route.params.expenseSplit
    const setSplitType = route.params.setExpenseSplitType
    const setSplitMembers = route.params.setExpenseSplitMembers

    return <Tab.Navigator>
        <Tab.Screen name="EquallyTab" children={() => <EquallyTab setSplitType={setSplitType} setSplitMembers={setSplitMembers} split={split} paidBy={paidBy} setSplit={setSplit} groupPK={groupPK} selectedMembers={selectedMembers} totalAmount={totalAmount} />} options={{
            title: "Equally",
        }} />
        <Tab.Screen name="UnequallyTab" children={() => <UnequallyTab paidBy={paidBy} split={split} setSplitType={setSplitType} setSplitMembers={setSplitMembers} setSplit={setSplit} groupPK={groupPK} selectedMembers={selectedMembers} totalAmount={totalAmount} />} options={{
            title: "Unequally"
        }} />
        <Tab.Screen name="ByPercentagesTab" component={ByPercentagesTab} options={{
            title: "By Percentages"
        }} />
    </Tab.Navigator>
}