import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const foods = ['한식', '중식', '일식', '양식', '분식'];
const distances = ['500m', '1km', '2km', '3km', '5km'];

export default function App() {
  const [food, setFood] = useState('한식');
  const [distance, setDistance] = useState('3km');
  const [randomFood, setRandomFood] = useState(false);
  const [ready, setReady] = useState(false);

  function chooseRandomFood() {
    const nextFood = foods[Math.floor(Math.random() * foods.length)];
    setFood(nextFood);
    setRandomFood(true);
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>오늘의 한 끼</Text>
        <Text accessibilityRole="header" style={styles.title}>오늘은 뭐 먹지?</Text>
        <Text style={styles.description}>가까운 곳에서 맛있는 한 끼를 찾아볼게요.</Text>

        <View style={styles.section}>
          <Text style={styles.label}>어떤 음식이 당기세요?</Text>
          <View style={styles.chips}>
            {foods.map((item) => (
              <Pressable
                key={item}
                accessibilityRole="button"
                accessibilityState={{ selected: food === item && !randomFood }}
                onPress={() => { setFood(item); setRandomFood(false); setReady(false); }}
                style={[styles.chip, food === item && !randomFood && styles.chipSelected]}
              >
                <Text style={[styles.chipText, food === item && !randomFood && styles.chipTextSelected]}>{item}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable accessibilityRole="button" onPress={chooseRandomFood} style={[styles.randomButton, randomFood && styles.randomSelected]}>
            <Text style={[styles.randomText, randomFood && styles.randomTextSelected]}>🎲 오늘의 메뉴 랜덤으로 고르기</Text>
          </Pressable>
          {randomFood && <Text style={styles.selectionNote}>오늘은 {food} 어때요?</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>어디까지 찾아볼까요?</Text>
          <View style={styles.chips}>
            {distances.map((item) => (
              <Pressable
                key={item}
                accessibilityRole="button"
                accessibilityState={{ selected: distance === item }}
                onPress={() => { setDistance(item); setReady(false); }}
                style={[styles.distanceChip, distance === item && styles.distanceSelected]}
              >
                <Text style={[styles.chipText, distance === item && styles.chipTextSelected]}>{item}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable accessibilityRole="button" onPress={() => setReady(true)} style={styles.searchButton}>
          <Text style={styles.searchButtonText}>주변 식당 찾아보기</Text>
          <Text style={styles.arrow}>→</Text>
        </Pressable>
        {ready && (
          <View accessibilityLiveRegion="polite" style={styles.notice}>
            <Text style={styles.noticeTitle}>{food} · {distance} 검색 조건을 골랐어요</Text>
            <Text style={styles.noticeText}>주변 식당 정보 연결은 다음 단계에서 진행해요.</Text>
          </View>
        )}
        <Text style={styles.hint}>목록에서 영업 중인 가게와 거리·가격순을 바꿀 수 있어요.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7F6F2' },
  content: { flexGrow: 1, width: '100%', maxWidth: 560, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 64, paddingBottom: 40 },
  eyebrow: { color: '#E36B45', fontSize: 14, fontWeight: '700', letterSpacing: 1 },
  title: { marginTop: 10, color: '#222920', fontSize: 34, fontWeight: '800', letterSpacing: -1 },
  description: { marginTop: 10, color: '#777C74', fontSize: 16, lineHeight: 24 },
  section: { marginTop: 36 },
  label: { marginBottom: 14, color: '#30372F', fontSize: 18, fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { minWidth: 66, alignItems: 'center', borderRadius: 22, borderWidth: 1, borderColor: '#E5E3DC', backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 11 },
  chipSelected: { borderColor: '#315B42', backgroundColor: '#315B42' },
  chipText: { color: '#52584F', fontSize: 15, fontWeight: '600' },
  chipTextSelected: { color: '#FFFFFF' },
  randomButton: { marginTop: 12, alignItems: 'center', borderRadius: 14, backgroundColor: '#F0EDE5', padding: 14 },
  randomSelected: { backgroundColor: '#F8E8DE' },
  randomText: { color: '#675D4F', fontSize: 15, fontWeight: '700' },
  randomTextSelected: { color: '#A94F31' },
  selectionNote: { marginTop: 10, color: '#A94F31', fontSize: 14, fontWeight: '600' },
  distanceChip: { minWidth: 66, alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: '#E5E3DC', backgroundColor: '#FFFFFF', paddingHorizontal: 14, paddingVertical: 12 },
  distanceSelected: { borderColor: '#315B42', backgroundColor: '#315B42' },
  searchButton: { marginTop: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 16, backgroundColor: '#E36B45', padding: 18 },
  searchButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  arrow: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  notice: { marginTop: 16, borderRadius: 14, backgroundColor: '#E9F0E8', padding: 16 },
  noticeTitle: { color: '#315B42', fontSize: 15, fontWeight: '700' },
  noticeText: { marginTop: 6, color: '#59685B', fontSize: 14, lineHeight: 21 },
  hint: { marginTop: 22, color: '#8A8D85', fontSize: 13, lineHeight: 20, textAlign: 'center' },
});
