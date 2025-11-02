import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCaptureStore } from '../../store/captureStore';
import { enhanceAPI } from '../../utils/api';
import { colors, typography, spacing } from '../../constants/theme';

const PROCESSING_STEPS = [
  { id: 1, label: 'Uploading', duration: 1000 },
  { id: 2, label: 'Segmentation', duration: 2000 },
  { id: 3, label: 'Enhancement', duration: 4000 },
  { id: 4, label: 'Compositing', duration: 2000 },
  { id: 5, label: 'Finalizing', duration: 1000 },
];

export default function ProcessingScreen() {
  const router = useRouter();
  const { capturedImages, currentSessionId } = useCaptureStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [jobId, setJobId] = useState<string | null>(null);

  useEffect(() => {
    startEnhancement();
  }, []);

  const startEnhancement = async () => {
    try {
      const lastImage = capturedImages[capturedImages.length - 1];
      if (!lastImage || !currentSessionId) return;

      // Start enhancement
      const response = await enhanceAPI.enhanceImage(
        currentSessionId,
        lastImage.id,
        lastImage.angle,
        lastImage.uri // In production, convert to base64
      );

      setJobId(response.job_id);
      
      // Animate through steps
      animateSteps();
    } catch (error) {
      console.error('Enhancement error:', error);
      // Still proceed with animation for demo
      animateSteps();
    }
  };

  const animateSteps = () => {
    let stepIndex = 0;
    let totalProgress = 0;

    const interval = setInterval(() => {
      if (stepIndex >= PROCESSING_STEPS.length) {
        clearInterval(interval);
        // Navigate to result after completion
        setTimeout(() => {
          router.replace('/preview/result');
        }, 500);
        return;
      }

      setCurrentStep(stepIndex);
      const stepDuration = PROCESSING_STEPS[stepIndex].duration;
      const progressPerStep = 100 / PROCESSING_STEPS.length;

      // Animate progress within step
      let stepProgress = 0;
      const progressInterval = setInterval(() => {
        stepProgress += 2;
        totalProgress = (stepIndex * progressPerStep) + (stepProgress * progressPerStep / 100);
        setProgress(totalProgress);

        if (stepProgress >= 100) {
          clearInterval(progressInterval);
        }
      }, stepDuration / 50);

      stepIndex++;
    }, 2000); // Move to next step every 2 seconds
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <ActivityIndicator size="large" color={colors.primaryBlue} />
        </View>

        <Text style={styles.title}>Enhancing Your Photo</Text>
        <Text style={styles.subtitle}>Estimated time: 6-12 seconds</Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        </View>

        <View style={styles.stepsContainer}>
          {PROCESSING_STEPS.map((step, index) => (
            <View key={step.id} style={styles.stepItem}>
              <View
                style={[
                  styles.stepIndicator,
                  index <= currentStep && styles.stepIndicatorActive,
                ]}
              >
                {index < currentStep ? (
                  <Text style={styles.stepIndicatorText}>✓</Text>
                ) : (
                  <Text style={styles.stepIndicatorText}>{step.id}</Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  index === currentStep && styles.stepLabelActive,
                ]}
              >
                {step.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: spacing.md,
    maxWidth: 400,
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.white,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.mutedGray,
    marginBottom: spacing.lg,
  },
  progressContainer: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primaryBlue,
    borderRadius: 4,
  },
  progressText: {
    ...typography.body,
    color: colors.primaryBlue,
    textAlign: 'center',
    fontWeight: '600',
  },
  stepsContainer: {
    width: '100%',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  stepIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  stepIndicatorActive: {
    backgroundColor: colors.primaryBlue,
  },
  stepIndicatorText: {
    ...typography.small,
    color: colors.white,
    fontWeight: '600',
  },
  stepLabel: {
    ...typography.body,
    color: colors.mutedGray,
  },
  stepLabelActive: {
    color: colors.white,
    fontWeight: '600',
  },
});