import * as ImageManipulator from 'expo-image-manipulator';

const MAX_IMAGE_SIZE = 500 * 1024; // 500KB
const MAX_DIMENSION = 800; // 最大宽高

/**
 * 压缩图片到指定大小以下
 * @param uri 图片 URI
 * @param maxSize 最大大小（字节），默认 500KB
 * @returns 压缩后的 base64 字符串
 */
export const compressImage = async (
  uri: string,
  maxSize: number = MAX_IMAGE_SIZE
): Promise<string> => {
  let quality = 0.8;
  let result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: MAX_DIMENSION } }],
    { compress: quality, format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );

  // 如果图片仍然太大，继续降低质量
  while (result.base64 && getBase64Size(result.base64) > maxSize && quality > 0.1) {
    quality -= 0.1;
    result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: MAX_DIMENSION } }],
      { compress: quality, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );
  }

  return result.base64 || '';
};

/**
 * 计算 base64 字符串的实际大小（字节）
 */
export const getBase64Size = (base64: string): number => {
  // base64 编码后大小约为原始大小的 4/3
  const padding = (base64.match(/=/g) || []).length;
  return Math.floor((base64.length * 3) / 4) - padding;
};

/**
 * 将 base64 转换为带前缀的 data URL
 */
export const toDataUrl = (base64: string, mimeType: string = 'image/jpeg'): string => {
  if (base64.startsWith('data:')) {
    return base64;
  }
  return `data:${mimeType};base64,${base64}`;
};
