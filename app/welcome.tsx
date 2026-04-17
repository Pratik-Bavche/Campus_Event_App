import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { ArrowRight } from 'lucide-react-native';
import React from 'react';
import {
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  FadeInUp 
} from 'react-native-reanimated';

const { width: screenWidth, height: screenHeight } = Dimensions.get('screen');

const videoSource = require('../assets/dypcoe1.mp4');

export default function WelcomeScreen() {
  const router = useRouter();

  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = true;
    player.play();
    player.muted = true;
  });

  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Background Video using expo-video */}
      <VideoView
        player={player}
        style={styles.backgroundVideo}
        contentFit="cover"
        nativeControls={false}
      />

      {/* Dark Overlay with Gradient */}
      <LinearGradient
        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.9)']}
        style={styles.overlay}
      >
        <View style={styles.content}>
          <View />

          <View style={styles.bottomSection}>
            <Animated.View entering={FadeInDown.delay(600).duration(800)}>
              <Text style={styles.title}>Experience Your College Life to the Fullest</Text>
              <Text style={styles.subtitle}>
                Discover, Register, and Excel in events across your campus. Join the community today.
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(900).duration(800)}>
              <TouchableOpacity
                onPress={handleGetStarted}
                activeOpacity={0.8}
                style={styles.buttonWrapper}
              >
                <LinearGradient
                  colors={['#2563eb', '#3b82f6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>Get Started</Text>
                  <View style={styles.buttonIcon}>
                    <ArrowRight size={20} color="#2563eb" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <Animated.Text 
              entering={FadeIn.delay(1200).duration(1000)}
              style={styles.footerText}
            >
              Exclusively for DYPCOE Students
            </Animated.Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: screenWidth,
    height: screenHeight,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: 30,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: screenHeight * 0.12,
    paddingBottom: screenHeight * 0.04,
  },
  bottomSection: {
    width: '100%',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    lineHeight: 44,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 24,
    marginBottom: 24,
  },
  buttonWrapper: {
    width: '100%',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  button: {
    flexDirection: 'row',
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 12,
  },
  buttonIcon: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 13,
    marginTop: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
