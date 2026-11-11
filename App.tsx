import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import { useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const foods = ['한식', '중식', '일식', '양식', '분식'];
const distances = [500, 1000, 2000, 3000, 5000];
const kakaoKey = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY;

type Restaurant = {
  id: string;
  place_name: string;
  category_name: string;
  road_address_name: string;
  address_name: string;
  distance: string;
  place_url: string;
};

export default function App() {
  const [food, setFood] = useState('한식');
  const [distance, setDistance] = useState(3000);
  const [screen, setScreen] = useState<'search' | 'results'>('search');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function searchRestaurants(random = false) {
    if (!kakaoKey) {
      setMessage('카카오 REST API 키를 .env 파일에 설정해 주세요.');
      return;
    }

    const selectedFood = random ? foods[Math.floor(Math.random() * foods.length)] : food;
    setFood(selectedFood);
    setLoading(true);
    setMessage('');
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) throw new Error('주변 식당을 찾으려면 위치 권한이 필요합니다.');
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const params = new URLSearchParams({
        query: `${selectedFood} 음식점`,
        x: String(position.coords.longitude),
        y: String(position.coords.latitude),
        radius: String(distance),
        sort: 'distance',
        size: '15',
      });
      const response = await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?${params}`, {
        headers: { Authorization: `KakaoAK ${kakaoKey}` },
      });
      if (!response.ok) throw new Error(response.status === 401 ? '카카오 REST API 키를 확인해 주세요.' : '식당 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
      const data = await response.json();
      const matches = (data.documents as Restaurant[]).filter((place) => place.category_name.includes('음식점'));
      setRestaurants(matches);
      setSelectedRestaurant(null);
      setScreen('results');
      if (matches.length === 0) setMessage(`${distanceLabel(distance)} 안에 ${selectedFood} 식당을 찾지 못했습니다.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>오늘의 한 끼</Text>
        <Text accessibilityRole="header" style={styles.title}>{screen === 'search' ? '오늘은 뭐 먹지?' : '주변 식당'}</Text>
        <Text style={styles.description}>{screen === 'search' ? '현재 위치에서 가까운 식당을 찾아볼게요.' : `${food} · ${distanceLabel(distance)} 안의 검색 결과`}</Text>

        {screen === 'search' ? (
          <>
            <View style={styles.section}>
              <Text style={styles.label}>어떤 음식이 당기세요?</Text>
              <View style={styles.chips}>
                {foods.map((item) => <Choice key={item} label={item} selected={food === item} onPress={() => setFood(item)} />)}
              </View>
              <Pressable accessibilityRole="button" onPress={() => searchRestaurants(true)} style={styles.randomButton}>
                <Text style={styles.randomText}>🎲 음식 종류 랜덤으로 고르기</Text>
              </Pressable>
            </View>
            <View style={styles.section}>
              <Text style={styles.label}>검색 거리</Text>
              <View style={styles.chips}>
                {distances.map((item) => <Choice key={item} label={distanceLabel(item)} selected={distance === item} onPress={() => setDistance(item)} />)}
              </View>
            </View>
            <Pressable accessibilityRole="button" disabled={loading} onPress={() => searchRestaurants()} style={[styles.searchButton, loading && styles.disabled]}>
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.searchButtonText}>주변 식당 찾아보기　→</Text>}
            </Pressable>
          </>
        ) : (
          <>
            {restaurants.map((place) => (
              <Pressable key={place.id} accessibilityRole="button" accessibilityState={{ selected: selectedRestaurant?.id === place.id }} onPress={() => setSelectedRestaurant(place)} style={[styles.card, selectedRestaurant?.id === place.id && styles.cardSelected]}>
                <View style={styles.cardTop}>
                  <Text style={styles.placeName}>{place.place_name}</Text>
                  <Text style={styles.placeDistance}>{formatDistance(Number(place.distance))}</Text>
                </View>
                <Text style={styles.category}>{place.category_name.split(' > ').slice(-1)[0]}</Text>
                <Text style={styles.address}>{place.road_address_name || place.address_name}</Text>
                <Text style={styles.link}>{selectedRestaurant?.id === place.id ? '목적지로 선택됨 ✓' : '눌러서 목적지로 선택'}</Text>
              </Pressable>
            ))}
            <Text style={styles.disclaimer}>식당 정보와 상세 내용은 카카오맵에서 확인할 수 있어요. 영업 여부와 가격 정보는 이 API에서 제공하지 않습니다.</Text>
            {selectedRestaurant && <Pressable accessibilityRole="button" onPress={() => Linking.openURL(selectedRestaurant.place_url)} style={styles.mapButton}><Text style={styles.mapButtonText}>선택한 식당 카카오맵에서 열기　↗</Text></Pressable>}
            <Pressable accessibilityRole="button" onPress={() => setScreen('search')} style={styles.backButton}><Text style={styles.backText}>검색 조건 바꾸기</Text></Pressable>
          </>
        )}

        {!!message && <Text accessibilityLiveRegion="polite" style={styles.message}>{message}</Text>}
      </ScrollView>
    </View>
  );
}

function Choice({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

function distanceLabel(meters: number) { return meters < 1000 ? `${meters}m` : `${meters / 1000}km`; }
function formatDistance(meters: number) { return meters < 1000 ? `${meters}m` : `${(meters / 1000).toFixed(1)}km`; }

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
  randomText: { color: '#675D4F', fontSize: 15, fontWeight: '700' },
  searchButton: { marginTop: 40, minHeight: 58, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: '#E36B45', padding: 18 },
  searchButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  disabled: { opacity: 0.7 },
  card: { marginTop: 14, borderRadius: 16, backgroundColor: '#FFFFFF', padding: 18, borderWidth: 1, borderColor: '#ECEAE3' },
  cardSelected: { borderColor: '#315B42', borderWidth: 2 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'center' },
  placeName: { flex: 1, color: '#222920', fontSize: 18, fontWeight: '700' },
  placeDistance: { color: '#315B42', fontSize: 14, fontWeight: '700' },
  category: { marginTop: 8, color: '#A94F31', fontSize: 13, fontWeight: '600' },
  address: { marginTop: 8, color: '#777C74', fontSize: 14, lineHeight: 21 },
  link: { marginTop: 12, color: '#315B42', fontSize: 14, fontWeight: '700' },
  mapButton: { marginTop: 18, alignItems: 'center', borderRadius: 14, backgroundColor: '#315B42', padding: 16 },
  mapButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  disclaimer: { marginTop: 18, color: '#777C74', fontSize: 13, lineHeight: 20 },
  backButton: { marginTop: 20, alignItems: 'center', borderRadius: 14, backgroundColor: '#E9F0E8', padding: 16 },
  backText: { color: '#315B42', fontSize: 15, fontWeight: '700' },
  message: { marginTop: 18, color: '#A94F31', fontSize: 14, lineHeight: 21 },
});
