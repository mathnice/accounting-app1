import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert, ActivityIndicator, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { parseSpeechText, recognizeImage, ParsedTransaction, ImageRecognitionResult } from '../services/aiService';
import colors from '../theme/colors';

interface AIInputButtonsProps {
  onSpeechResult: (result: ParsedTransaction) => void;
  onImageResult: (result: ImageRecognitionResult) => void;
  disabled?: boolean;
}

export default function AIInputButtons({ onSpeechResult, onImageResult, disabled }: AIInputButtonsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingType, setProcessingType] = useState<'voice' | 'camera' | null>(null);
  const [voiceModalVisible, setVoiceModalVisible] = useState(false);
  const [voiceText, setVoiceText] = useState('');

  // Handle voice input - show modal for text input
  const handleVoiceInput = () => {
    setVoiceText('');
    setVoiceModalVisible(true);
  };

  // Submit voice text
  const handleVoiceSubmit = async () => {
    if (!voiceText.trim()) {
      Alert.alert('提示', '请输入交易描述');
      return;
    }

    setVoiceModalVisible(false);
    setIsProcessing(true);
    setProcessingType('voice');

    try {
      const response = await parseSpeechText(voiceText.trim());
      onSpeechResult(response.data);
    } catch (error) {
      console.error('Speech parsing error:', error);
      Alert.alert('错误', '语音解析失败，请重试');
    } finally {
      setIsProcessing(false);
      setProcessingType(null);
      setVoiceText('');
    }
  };

  // Handle camera/gallery input
  const handleCameraInput = async () => {
    // Show mode selection
    Alert.alert(
      '选择识别模式',
      '请选择要识别的内容类型',
      [
        {
          text: '物品识别',
          onPress: () => pickImage('object'),
        },
        {
          text: '票据扫描',
          onPress: () => pickImage('receipt'),
        },
        {
          text: '取消',
          style: 'cancel',
        },
      ]
    );
  };

  const pickImage = async (mode: 'object' | 'receipt') => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('权限不足', '需要相册访问权限才能使用此功能');
      return;
    }

    // Show source selection
    Alert.alert(
      '选择图片来源',
      '',
      [
        {
          text: '拍照',
          onPress: () => launchCamera(mode),
        },
        {
          text: '从相册选择',
          onPress: () => launchGallery(mode),
        },
        {
          text: '取消',
          style: 'cancel',
        },
      ]
    );
  };

  const launchCamera = async (mode: 'object' | 'receipt') => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('权限不足', '需要相机权限才能使用此功能');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      processImage(result.assets[0].base64, mode);
    }
  };

  const launchGallery = async (mode: 'object' | 'receipt') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      processImage(result.assets[0].base64, mode);
    }
  };

  const processImage = async (base64: string, mode: 'object' | 'receipt') => {
    setIsProcessing(true);
    setProcessingType('camera');

    try {
      const response = await recognizeImage(base64, mode);
      onImageResult(response.data);
    } catch (error) {
      console.error('Image recognition error:', error);
      Alert.alert('错误', '图片识别失败，请重试');
    } finally {
      setIsProcessing(false);
      setProcessingType(null);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, disabled && styles.disabled]}
        onPress={handleVoiceInput}
        disabled={disabled || isProcessing}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryLight]}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {isProcessing && processingType === 'voice' ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text style={styles.buttonIcon}>🎤</Text>
              <Text style={styles.buttonText}>语音记账</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, disabled && styles.disabled]}
        onPress={handleCameraInput}
        disabled={disabled || isProcessing}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[colors.success, colors.successLight]}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {isProcessing && processingType === 'camera' ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text style={styles.buttonIcon}>📷</Text>
              <Text style={styles.buttonText}>拍照记账</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Voice Input Modal */}
      <Modal visible={voiceModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎤 语音记账</Text>
            <Text style={styles.modalHint}>请输入交易描述（如：午餐花了35元）</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="输入交易描述..."
              placeholderTextColor={colors.textMuted}
              value={voiceText}
              onChangeText={setVoiceText}
              autoFocus
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => {
                  setVoiceModalVisible(false);
                  setVoiceText('');
                }}
              >
                <Text style={styles.modalCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleVoiceSubmit}>
                <LinearGradient
                  colors={[colors.gradientStart, colors.gradientEnd]}
                  style={styles.modalSubmitGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.modalSubmitText}>确定</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  button: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  buttonIcon: {
    fontSize: 20,
  },
  buttonText: {
    color: colors.textWhite,
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: colors.textPrimary,
  },
  modalHint: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    color: colors.textPrimary,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalCancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  modalSubmitBtn: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  modalSubmitGradient: {
    padding: 14,
    alignItems: 'center',
  },
  modalSubmitText: {
    fontSize: 16,
    color: colors.textWhite,
    fontWeight: '600',
  },
});
