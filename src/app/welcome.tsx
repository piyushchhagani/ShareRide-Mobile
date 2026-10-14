import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.topline}><View style={styles.dot} /><Text style={styles.brand}>SHARERIDE</Text><Text style={styles.campus}>CAMPUS MOBILITY</Text></View>
        <View style={styles.art}>
          <View style={styles.sun} />
          <View style={styles.road} />
          <View style={styles.car}><View style={styles.window} /><View style={styles.wheelOne} /><View style={styles.wheelTwo} /></View>
          <View style={styles.pin}><Text style={styles.pinText}>></Text></View>
          <View style={styles.floating}><Text style={styles.floatingTitle}>Same way?</Text><Text style={styles.floatingSub}>Make the trip together.</Text></View>
        </View>
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>LESS SOLO. MORE TOGETHER.</Text>
          <Text style={styles.title}>Your people.{ "\n" }Your route.</Text>
          <Text style={styles.description}>Share everyday journeys with your campus community. Find a seat or offer one.</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.primary} onPress={() => router.push("/auth/register")}><Text style={styles.primaryText}>Get started <Text style={styles.arrow}>></Text></Text></TouchableOpacity>
          <TouchableOpacity style={styles.secondary} onPress={() => router.push("/auth/login")}><Text style={styles.secondaryText}>I already have an account</Text></TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:"#F4F3ED"},container:{flex:1,paddingHorizontal:24,paddingTop:12,paddingBottom:18},
  topline:{flexDirection:"row",alignItems:"center",gap:8},dot:{width:10,height:10,borderRadius:5,backgroundColor:"#7BAA3D"},brand:{fontSize:13,fontWeight:"900",letterSpacing:2,color:"#171A14"},campus:{marginLeft:"auto",fontSize:9,letterSpacing:1,color:"#777B70",fontWeight:"800"},
  art:{height:285,marginTop:20,backgroundColor:"#DCE7CE",borderRadius:30,overflow:"hidden",justifyContent:"center"},
  sun:{position:"absolute",width:180,height:180,borderRadius:90,backgroundColor:"#C3D9A7",top:22,right:24},
  road:{position:"absolute",height:90,left:-20,right:-20,bottom:20,backgroundColor:"#AAB69D",transform:[{rotate:"-9deg"}],borderRadius:30},
  car:{position:"absolute",width:190,height:74,borderRadius:26,backgroundColor:"#B7F36B",left:46,bottom:76,transform:[{rotate:"-7deg"}],borderWidth:3,borderColor:"#1A1D16"},
  window:{position:"absolute",width:82,height:34,backgroundColor:"#F4F3ED",borderRadius:12,left:49,top:-20,borderWidth:3,borderColor:"#1A1D16"},
  wheelOne:{position:"absolute",width:28,height:28,borderRadius:14,backgroundColor:"#1A1D16",bottom:-12,left:24,borderWidth:5,borderColor:"#F4F3ED"},
  wheelTwo:{position:"absolute",width:28,height:28,borderRadius:14,backgroundColor:"#1A1D16",bottom:-12,right:24,borderWidth:5,borderColor:"#F4F3ED"},
  pin:{position:"absolute",right:37,top:42,width:48,height:48,borderRadius:17,backgroundColor:"#171A14",alignItems:"center",justifyContent:"center",transform:[{rotate:"8deg"}]},pinText:{fontSize:27,color:"#B7F36B",fontWeight:"800"},
  floating:{position:"absolute",left:16,top:20,backgroundColor:"#FFFFFF",paddingVertical:12,paddingHorizontal:15,borderRadius:16,elevation:3},floatingTitle:{fontWeight:"900",fontSize:13,color:"#171A14"},floatingSub:{fontSize:10,color:"#70766A",marginTop:3},
  copy:{marginTop:26},eyebrow:{color:"#67843E",fontSize:10,fontWeight:"900",letterSpacing:2},title:{fontSize:43,lineHeight:47,fontWeight:"900",letterSpacing:-2,color:"#171A14",marginTop:10},description:{fontSize:15,lineHeight:23,color:"#666B60",marginTop:12,maxWidth:330},
  actions:{marginTop:"auto",gap:12},primary:{height:58,borderRadius:18,backgroundColor:"#171A14",alignItems:"center",justifyContent:"center"},primaryText:{color:"#FFFFFF",fontWeight:"800",fontSize:16},arrow:{color:"#B7F36B"},secondary:{height:48,alignItems:"center",justifyContent:"center"},secondaryText:{fontSize:14,color:"#30342B",fontWeight:"700"},
});
