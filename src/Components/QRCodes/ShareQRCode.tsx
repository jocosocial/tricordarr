import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import QRCodeStyled from 'react-native-qrcode-styled';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';

export const shareQrSize = 220;

interface ShareQRCodeProps {
  url: string;
}

/**
 * QR code for a share URL or app URI. Shows a same-size spinner on first mount
 * so generation does not block the Hide label or jump the sheet layout.
 * Changing `url` updates the existing QR in place so the share sheet does not
 * remount or flash a spinner.
 */
export const ShareQRCode = ({url}: ShareQRCodeProps) => {
  const [renderQrCode, setRenderQrCode] = useState(false);
  const [qrReady, setQrReady] = useState(false);
  const {theme} = useAppTheme();
  const {commonStyles} = useStyles();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        slot: {
          width: shareQrSize,
          height: shareQrSize,
          ...commonStyles.alignItemsCenter,
          ...commonStyles.justifyCenter,
          backgroundColor: theme.colors.surface,
        },
        spinner: {
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        },
        qr: {
          width: shareQrSize,
          height: shareQrSize,
        },
      }),
    [commonStyles, theme.colors.surface],
  );

  /**
   * Paint the spinner first. QR generation is synchronous and would otherwise
   * block that commit so the spinner never appears.
   */
  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setRenderQrCode(true);
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

  /**
   * Drops the spinner once the QR SVG has a measured size.
   */
  const handleQrLayout = useCallback(() => {
    setQrReady(true);
  }, []);

  return (
    <View style={styles.slot}>
      {!qrReady && (
        <View style={styles.spinner}>
          <ActivityIndicator size={'large'} color={theme.colors.twitarrNeutralButton} />
        </View>
      )}
      {renderQrCode && (
        <QRCodeStyled
          data={url}
          size={shareQrSize}
          padding={16}
          color={theme.colors.onBackground}
          errorCorrectionLevel={'H'}
          pieceScale={1.02}
          isPiecesGlued={true}
          style={styles.qr}
          onLayout={handleQrLayout}
        />
      )}
    </View>
  );
};
