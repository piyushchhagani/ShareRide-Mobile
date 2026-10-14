import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";

const places = [
  { name: "Campus", icon: "P" },
  { name: "Railway station", icon: "P" },
  { name: "Airport", icon: "P" },
  { name: "City centre", icon: "P" },
  { name: "Gittikhadan", icon: "P" },
  { name: "Sitabuldi", icon: "P" },
  { name: "Dharampeth", icon: "P" },
  { name: "Medical Square", icon: "P" },
];

export default function FrequentPlaces({ type = "destination" }: { type?: "pickup" | "destination" }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <View style={styles.wrap}>
      <View style={styles.heading}>
        <Text style={styles.title}>FREQUENT PLACES</Text>
        <TouchableOpacity onPress={() => setExpanded((value) => !value)}>
          <Text style={styles.more}>{expanded ? "Show less" : "See more"}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.chips}>
        {places.slice(0, expanded ? places.length : 4).map((place) => (
          <TouchableOpacity key={place.name} style={styles.chip} onPress={() => router.push({ pathname: "/location", params: { type, query: place.name } })}>
            <Text style={styles.icon}>{place.name.charAt(0)}</Text>
            <Text style={styles.name}>{place.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.note}>Suggestions help start your search. Confirm the exact location before continuing.</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  wrap:{marginTop:20},heading:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginBottom:10},title:{fontSize:10,letterSpacing:1.5,fontWeight:"900",color:"#73796B"},more:{fontSize:11,fontWeight:"900",color:"#4F633B"},chips:{flexDirection:"row",flexWrap:"wrap",gap:8},chip:{flexDirection:"row",alignItems:"center",gap:7,paddingHorizontal:12,paddingVertical:10,borderRadius:14,backgroundColor:"#FFFFFF",borderWidth:1,borderColor:"#E5E7DE"},icon:{fontSize:14,color:"#567A30"},name:{fontSize:11,fontWeight:"800",color:"#30342B"},note:{fontSize:10,color:"#8A8E83",lineHeight:15,marginTop:9},
});
