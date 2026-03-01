import * as UAParser from 'ua-parser-js';

export interface DeviceInfo {
  isIOS: boolean;
  isAndroid: boolean;
  isMobile: boolean;
  browserName: string;
  osName: string;
}

export function getDeviceInfo(): DeviceInfo {
  const parser = new UAParser.UAParser();
  const result = parser.getResult();
  
  const osName = result.os.name?.toLowerCase() || '';
  const browserName = result.browser.name?.toLowerCase() || '';
  
  // iOS detection: iPadOS reports as macOS but has touch points
  const isIOS = osName.includes('ios') || 
                (osName.includes('mac') && 
                 browserName.includes('safari') && 
                 navigator.maxTouchPoints > 0);
  
  return {
    isIOS,
    isAndroid: osName.includes('android'),
    isMobile: result.device.type === 'mobile' || result.device.type === 'tablet',
    browserName: result.browser.name || 'unknown',
    osName: result.os.name || 'unknown',
  };
}