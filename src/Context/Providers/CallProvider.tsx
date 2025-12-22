import { useAppState } from '@react-native-community/hooks';
import React, { PropsWithChildren, useCallback, useEffect, useReducer, useRef } from 'react';
import { Platform } from 'react-native';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { v4 as uuidv4 } from 'uuid';

import { CallContext, CallState } from '#src/Context/Contexts/CallContext';
import { useSnackbar } from '#src/Context/Contexts/SnackbarContext';
import { decodeAudioPacket, encodeAudioPacket } from '#src/Libraries/Audio/AudioCodec';
import { AudioJitterBuffer } from '#src/Libraries/Audio/AudioJitterBuffer';
import { NativeAudioEngine } from '#src/Libraries/Audio/NativeAudioEngine';
import {
  dismissCallForegroundNotification,
  showCallForegroundNotification,
  updateCallForegroundNotification,
} from '#src/Libraries/Call/CallForegroundService';
import { buildPhoneCallWebSocket } from '#src/Libraries/Network/Websockets';
import { usePhoneCallAnswerMutation, usePhoneCallDeclineMutation } from '#src/Queries/PhoneCall/PhoneCallMutations';
import { CallActions, callReducer, initialCallState } from '#src/Reducers/Call/CallReducer';
import { UserHeader } from '#src/Structs/ControllerStructs';

export const CallProvider = ({ children }: PropsWithChildren) => {
  const [state, dispatch] = useReducer(callReducer, initialCallState);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const notificationUpdateIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioEngineRef = useRef<NativeAudioEngine | null>(null);
  const jitterBufferRef = useRef<AudioJitterBuffer | null>(null);
  const playbackIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const callStateRef = useRef<CallState>(state.state);
  const speakerStateRef = useRef<boolean>(state.isSpeakerOn);
  const appState = useAppState();
  const { setSnackbarPayload } = useSnackbar();

  // Keep refs in sync with state
  useEffect(() => {
    callStateRef.current = state.state;
  }, [state.state]);

  useEffect(() => {
    speakerStateRef.current = state.isSpeakerOn;
  }, [state.isSpeakerOn]);

  const answerMutation = usePhoneCallAnswerMutation();
  const declineMutation = usePhoneCallDeclineMutation();

  // Start audio engine and wire up audio streaming
  const startAudioStreaming = useCallback(
    async (phoneSocket: ReconnectingWebSocket) => {
      try {
        // Check if native audio engine is available
        if (!NativeAudioEngine.isAvailable()) {
          console.error(
            '[CallProvider] Native AudioEngine module not available. Call will continue but audio will not work.',
          );
          setSnackbarPayload({
            message: 'Audio engine not available. Please rebuild the app to enable voice calls.',
            messageType: 'error',
          });
          return;
        }

        // Note: We don't check state here because this function is called immediately after
        // dispatching CONNECT, and React state updates are asynchronous. The state will be
        // ACTIVE by the time audio actually starts streaming.

        // Initialize audio engine
        if (!audioEngineRef.current) {
          audioEngineRef.current = new NativeAudioEngine();
        }

        // Initialize jitter buffer
        if (!jitterBufferRef.current) {
          jitterBufferRef.current = new AudioJitterBuffer();
        }

        const audioEngine = audioEngineRef.current;
        const jitterBuffer = jitterBufferRef.current;

        // Set up microphone data listener - send to WebSocket
        audioEngine.setAudioDataListener(event => {
          try {
            // Only send if socket is open and call is active
            if (phoneSocket.readyState !== WebSocket.OPEN) {
              console.warn('[CallProvider] Cannot send audio packet - socket not open, state:', phoneSocket.readyState);
              return;
            }

            // Check call state before sending (use ref to avoid stale closure)
            if (callStateRef.current !== CallState.ACTIVE) {
              // Call is no longer active, stop sending audio
              return;
            }

            const samples = new Int16Array(event.samples);
            if (samples.length === 0) {
              // Skip empty audio packets
              return;
            }

            const packet = encodeAudioPacket(samples);
            if (!packet || packet.byteLength === 0) {
              console.warn('[CallProvider] Encoded audio packet is empty');
              return;
            }

            // Validate packet size (should be at least 4 bytes for frame count + at least some audio data)
            if (packet.byteLength < 4) {
              console.warn('[CallProvider] Audio packet too small:', packet.byteLength);
              return;
            }

            // Double-check socket is still open before sending
            if (phoneSocket.readyState === WebSocket.OPEN) {
              try {
                phoneSocket.send(packet);
              } catch (sendError) {
                console.error('[CallProvider] Error sending audio packet:', sendError);
                // If send fails, remove listener to prevent further errors
                try {
                  audioEngine.removeAudioDataListener();
                } catch (e) {
                  console.error('[CallProvider] Failed to remove audio listener:', e);
                }
              }
            } else {
              console.warn('[CallProvider] Socket closed while preparing audio packet, state:', phoneSocket.readyState);
            }
          } catch (error) {
            console.error('[CallProvider] Failed to send audio packet:', error);
            // If sending fails, it might mean the socket closed - don't crash
            // Stop the audio listener to prevent further errors
            try {
              audioEngine.removeAudioDataListener();
            } catch (e) {
              console.error('[CallProvider] Failed to remove audio listener:', e);
            }
          }
        });

        // Start audio engine
        await audioEngine.start();
        console.log('[CallProvider] Audio engine started');

        // Set initial speaker state to match the current state
        // This ensures the native audio session matches the React state
        // Use ref to get the current speaker state (state updates are async)
        try {
          await audioEngine.setSpeakerOn(speakerStateRef.current);
          console.log('[CallProvider] Set initial speaker state:', speakerStateRef.current);
        } catch (error) {
          console.error('[CallProvider] Failed to set initial speaker state:', error);
        }

        // Start playback loop - pull from jitter buffer every 20ms
        playbackIntervalRef.current = setInterval(() => {
          const samples = jitterBuffer.dequeue();
          if (samples && samples.length > 0) {
            audioEngine.playAudio(Array.from(samples));
          }
        }, 20);

        console.log('[CallProvider] Audio streaming started');
      } catch (error) {
        console.error('[CallProvider] Failed to start audio streaming:', error);
      }
    },
    [setSnackbarPayload],
  );

  // Stop audio engine and cleanup
  const stopAudioStreaming = useCallback(async () => {
    try {
      // Stop playback loop
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
        playbackIntervalRef.current = null;
      }

      // Clear jitter buffer
      if (jitterBufferRef.current) {
        jitterBufferRef.current.clear();
      }

      // Stop and cleanup audio engine
      if (audioEngineRef.current) {
        audioEngineRef.current.removeAudioDataListener();
        await audioEngineRef.current.stop();
      }

      console.log('[CallProvider] Audio streaming stopped');
    } catch (error) {
      console.error('[CallProvider] Failed to stop audio streaming:', error);
    }
  }, []);

  const initiateCall = useCallback(
    async (userHeader: UserHeader) => {
      const callID = uuidv4();

      dispatch({
        type: CallActions.INITIATE,
        payload: {
          callID,
          remoteUser: userHeader,
        },
      });

      try {
        const ws = await buildPhoneCallWebSocket(callID, userHeader.userID);
        console.log('[CallProvider] WebSocket created, readyState:', ws.readyState);
        const socketOpenedRef = { current: false };
        const socketCreatedTime = Date.now();

        ws.addEventListener('open', () => {
          socketOpenedRef.current = true;
          console.log('[CallProvider] Phone call socket opened for caller', {
            readyState: ws.readyState,
            url: ws.url,
          });
          dispatch({ type: CallActions.SET_SOCKET, payload: ws });
        });

        ws.addEventListener('message', event => {
          if (event.data instanceof ArrayBuffer) {
            // Server sends PhoneSocketStartData as binary, so try to parse as JSON first
            // Audio packets start with UInt32 frame count, so they're at least 4 bytes
            // JSON messages will be smaller and parseable as text
            const buffer = event.data;

            // Helper to convert ArrayBuffer to string (React Native compatible)
            const bufferToString = (buf: ArrayBuffer): string => {
              const bytes = new Uint8Array(buf);
              let str = '';
              for (let i = 0; i < bytes.length; i++) {
                str += String.fromCharCode(bytes[i]);
              }
              return str;
            };

            try {
              // Try to decode as UTF-8 text (for JSON messages like PhoneSocketStartData)
              const text = bufferToString(buffer);
              console.log('[CallProvider] Received ArrayBuffer message, decoded as text:', text.substring(0, 100));
              const data = JSON.parse(text);
              if (data.phonecallStartTime) {
                console.log('[CallProvider] Call connected, starting audio');
                dispatch({ type: CallActions.CONNECT });
                // Start audio streaming when call connects
                startAudioStreaming(ws);
                return;
              }
            } catch (jsonError) {
              // Not JSON, try to decode as audio packet
              // Audio packets are typically much larger (at least 4 bytes for frame count + audio data)
              // If it's a small buffer, it might be a different message type
              if (buffer.byteLength < 100) {
                const text = bufferToString(buffer);
                console.warn('[CallProvider] Small ArrayBuffer message that failed JSON parse:', text, jsonError);
              }
              try {
                const samples = decodeAudioPacket(buffer);
                if (jitterBufferRef.current) {
                  jitterBufferRef.current.enqueue(samples);
                }
              } catch (audioError) {
                console.error('[CallProvider] Failed to decode message as JSON or audio:', {
                  bufferSize: buffer.byteLength,
                  jsonError: jsonError instanceof Error ? jsonError.message : jsonError,
                  audioError: audioError instanceof Error ? audioError.message : audioError,
                });
              }
            }
          } else {
            // Handle other types (string, Blob, object, etc.)
            console.log('[CallProvider] Received message of type:', typeof event.data, 'value:', event.data);

            // First check if it's already a parsed object with phonecallStartTime
            if (
              typeof event.data === 'object' &&
              event.data !== null &&
              !(event.data instanceof ArrayBuffer) &&
              'phonecallStartTime' in event.data
            ) {
              console.log('[CallProvider] Call connected, starting audio (from object)');
              dispatch({ type: CallActions.CONNECT });
              startAudioStreaming(ws);
              return;
            }

            // Try to get the data as a string
            let textData: string | null = null;
            if (typeof event.data === 'string') {
              textData = event.data;
            } else if (
              event.data instanceof Blob ||
              (typeof event.data === 'object' && event.data !== null && '_data' in event.data)
            ) {
              // Handle Blob (including React Native Blob format with _data property)
              // React Native Blobs may not have standard methods, so we need to handle them differently
              const blob = event.data;

              // For React Native Blobs, try to use the data property directly if available
              if (typeof blob === 'object' && blob !== null && 'data' in blob && typeof blob.data === 'object') {
                // React Native Blob might have data accessible directly
                try {
                  // Try to access the underlying data
                  const blobData = (blob as any).data;
                  if (blobData && typeof blobData === 'string') {
                    const data = JSON.parse(blobData);
                    if (data.phonecallStartTime) {
                      console.log('[CallProvider] Call connected, starting audio (from Blob.data)');
                      dispatch({ type: CallActions.CONNECT });
                      startAudioStreaming(ws);
                      return;
                    }
                  }
                } catch (e) {
                  console.warn('[CallProvider] Failed to access Blob.data directly', e);
                }
              }

              // Try standard Blob methods if available
              if ('text' in blob && typeof blob.text === 'function') {
                blob
                  .text()
                  .then((text: string) => {
                    console.log('[CallProvider] Received Blob message, decoded as text:', text.substring(0, 100));
                    try {
                      const data = JSON.parse(text);
                      if (data.phonecallStartTime) {
                        console.log('[CallProvider] Call connected, starting audio');
                        dispatch({ type: CallActions.CONNECT });
                        startAudioStreaming(ws);
                      }
                    } catch (e) {
                      console.warn('[CallProvider] Failed to parse Blob message as JSON', e);
                    }
                  })
                  .catch((error: Error) => {
                    console.warn('[CallProvider] Failed to read Blob as text', error);
                  });
              } else if ('arrayBuffer' in blob && typeof blob.arrayBuffer === 'function') {
                blob.arrayBuffer().then((buffer: ArrayBuffer) => {
                  const bufferToString = (buf: ArrayBuffer): string => {
                    const bytes = new Uint8Array(buf);
                    let str = '';
                    for (let i = 0; i < bytes.length; i++) {
                      str += String.fromCharCode(bytes[i]);
                    }
                    return str;
                  };
                  try {
                    const text = bufferToString(buffer);
                    const data = JSON.parse(text);
                    if (data.phonecallStartTime) {
                      console.log('[CallProvider] Call connected, starting audio');
                      dispatch({ type: CallActions.CONNECT });
                      startAudioStreaming(ws);
                    }
                  } catch (e) {
                    console.warn('[CallProvider] Failed to parse Blob message', e);
                  }
                });
              } else {
                console.error(
                  '[CallProvider] Blob does not support text() or arrayBuffer(), and data property not accessible',
                  event.data,
                );
              }
              return;
            } else if (typeof event.data === 'object' && event.data !== null) {
              // Try to stringify if it's an object
              try {
                textData = JSON.stringify(event.data);
              } catch (e) {
                console.warn('[CallProvider] Could not stringify message data', e);
              }
            }

            // Try to parse as JSON if we have text data
            if (textData) {
              try {
                const data = JSON.parse(textData);
                if (data.phonecallStartTime) {
                  console.log('[CallProvider] Call connected, starting audio');
                  dispatch({ type: CallActions.CONNECT });
                  startAudioStreaming(ws);
                }
              } catch (e) {
                console.warn(
                  '[CallProvider] Failed to parse socket message as JSON',
                  e,
                  'textData:',
                  textData?.substring(0, 100),
                );
              }
            } else {
              console.warn('[CallProvider] Unhandled message type:', typeof event.data, event.data);
            }
          }
        });

        ws.addEventListener('close', event => {
          const closeInfo = {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
            readyState: ws.readyState,
            socketOpened: socketOpenedRef.current,
            timeSinceCreation: Date.now() - socketCreatedTime,
          };
          console.log('[CallProvider] Phone call socket closed', closeInfo);

          // If socket closed before opening, or closed very quickly after opening, it's likely a rejection
          // Even if it's a "clean" close (code 1000), a server can reject during handshake with 1000
          const timeSinceCreation = Date.now() - socketCreatedTime;
          const closedBeforeOpening = !socketOpenedRef.current;
          const closedQuickly = timeSinceCreation < 5000;

          // Check for specific error codes that indicate call rejection
          // 1008 = Policy Violation (often used for auth/validation failures)
          // 1002 = Protocol Error
          // 1006 = Abnormal Closure (no close frame received)
          // 1000 = Normal Closure
          // 1001 = Going Away (can be normal, especially if socket was open and working)
          // Only treat as error if it's a clear error code, or if wasClean is false AND it closed quickly AND socket never opened
          const isClearError =
            event.code === 1002 ||
            event.code === 1006 ||
            event.code === 1008 ||
            (event.code >= 4000 && event.code < 5000);
          // Code 1000/1001 with wasClean: false that happens quickly before socket opens is likely an error
          // But if socket was open and working, code 1001 might be normal (server going away, network issue, etc.)
          const isUncleanNormalClose = !event.wasClean && (event.code === 1000 || event.code === 1001);
          const isErrorClose = isClearError || (isUncleanNormalClose && closedQuickly && !socketOpenedRef.current);
          const isLikelyRejection = closedBeforeOpening || (closedQuickly && isErrorClose);

          // Show error message if this looks like a rejection
          // Check state.currentCall before dispatch to ensure we have the call info
          const currentCall = state.currentCall;
          console.log(
            '[CallProvider] Close handler - isLikelyRejection:',
            isLikelyRejection,
            'currentCall:',
            !!currentCall,
            'closedBeforeOpening:',
            closedBeforeOpening,
          );

          if (isLikelyRejection && currentCall) {
            const callDuration = currentCall.startTime ? Date.now() - currentCall.startTime.getTime() : 0;

            // If call ended within 5 seconds or never started (startTime is null), it's likely a rejection
            if (!currentCall.startTime || callDuration < 5000) {
              let errorMessage = 'Call failed. ';
              if (event.reason) {
                errorMessage += event.reason;
              } else if (closedBeforeOpening) {
                errorMessage +=
                  'Connection rejected. User may not be available, may have blocked you, or may not have favorited you.';
              } else if (event.code === 1008) {
                errorMessage += 'User may not be available, may have blocked you, or may not have favorited you.';
              } else if (event.code === 1002) {
                errorMessage += 'Connection error. Please try again.';
              } else if (event.code === 1006) {
                errorMessage += 'Connection lost. Please try again.';
              } else {
                errorMessage += `Error code: ${event.code}`;
              }

              console.error(
                '[CallProvider] Call rejected by server:',
                event.reason || `Close code: ${event.code}`,
                closeInfo,
              );
              // Show snackbar error - use setTimeout to ensure it shows after state update
              setTimeout(() => {
                setSnackbarPayload({ message: errorMessage, messageType: 'error' });
              }, 100);
            }
          } else if (isLikelyRejection && !currentCall) {
            // Call was rejected but currentCall is already null - show error anyway
            let errorMessage =
              'Call failed. Connection rejected. User may not be available, may have blocked you, or may not have favorited you.';
            console.error(
              '[CallProvider] Call rejected by server (no currentCall):',
              event.reason || `Close code: ${event.code}`,
              closeInfo,
            );
            setTimeout(() => {
              setSnackbarPayload({ message: errorMessage, messageType: 'error' });
            }, 100);
          }

          stopAudioStreaming();
          dispatch({ type: CallActions.END });
        });

        ws.addEventListener('error', error => {
          // Check if socket is already closing/closed - if so, this is likely a normal close event
          // WebSocket error events can fire during normal closures in React Native
          if (ws.readyState === WebSocket.CLOSING || ws.readyState === WebSocket.CLOSED) {
            console.log('[CallProvider] Phone call socket error during close (expected)');
            return;
          }
          // Only log as error if socket is still open/connecting
          console.error('[CallProvider] Phone call socket error', error);
          stopAudioStreaming();
          dispatch({ type: CallActions.END });
        });
      } catch (error) {
        console.error('[CallProvider] Failed to initiate call', error);
        dispatch({ type: CallActions.END });
      }
    },
    [startAudioStreaming, stopAudioStreaming, state.isSpeakerOn, setSnackbarPayload, state.currentCall],
  );

  const receiveCall = useCallback((callID: string, callerUserHeader: UserHeader) => {
    console.log('[CallProvider] Receiving incoming call from', callerUserHeader.username);
    dispatch({
      type: CallActions.RECEIVE,
      payload: {
        callID,
        remoteUser: callerUserHeader,
      },
    });
  }, []);

  const answerCall = useCallback(
    async (callID: string) => {
      if (!state.currentCall) {
        console.warn('[CallProvider] No current call to answer');
        return;
      }

      dispatch({ type: CallActions.ANSWER, payload: { callID } });

      try {
        const ws = await buildPhoneCallWebSocket(callID);
        console.log('[CallProvider] WebSocket created for callee, readyState:', ws.readyState);
        const socketOpenedRef = { current: false };
        const socketCreatedTime = Date.now();

        ws.addEventListener('open', () => {
          socketOpenedRef.current = true;
          console.log('[CallProvider] Phone call socket opened for callee', {
            readyState: ws.readyState,
            url: ws.url,
          });
          dispatch({ type: CallActions.SET_SOCKET, payload: ws });
        });

        ws.addEventListener('message', event => {
          if (event.data instanceof ArrayBuffer) {
            // Server sends PhoneSocketStartData as binary, so try to parse as JSON first
            // Audio packets start with UInt32 frame count, so they're at least 4 bytes
            // JSON messages will be smaller and parseable as text
            const buffer = event.data;

            // Helper to convert ArrayBuffer to string (React Native compatible)
            const bufferToString = (buf: ArrayBuffer): string => {
              const bytes = new Uint8Array(buf);
              let str = '';
              for (let i = 0; i < bytes.length; i++) {
                str += String.fromCharCode(bytes[i]);
              }
              return str;
            };

            try {
              // Try to decode as UTF-8 text (for JSON messages like PhoneSocketStartData)
              const text = bufferToString(buffer);
              console.log('[CallProvider] Received ArrayBuffer message, decoded as text:', text.substring(0, 100));
              const data = JSON.parse(text);
              if (data.phonecallStartTime) {
                console.log('[CallProvider] Call connected, starting audio');
                dispatch({ type: CallActions.CONNECT });
                // Start audio streaming when call connects
                startAudioStreaming(ws);
                return;
              }
            } catch (jsonError) {
              // Not JSON, try to decode as audio packet
              // Audio packets are typically much larger (at least 4 bytes for frame count + audio data)
              // If it's a small buffer, it might be a different message type
              if (buffer.byteLength < 100) {
                const text = bufferToString(buffer);
                console.warn('[CallProvider] Small ArrayBuffer message that failed JSON parse:', text, jsonError);
              }
              try {
                const samples = decodeAudioPacket(buffer);
                if (jitterBufferRef.current) {
                  jitterBufferRef.current.enqueue(samples);
                }
              } catch (audioError) {
                console.error('[CallProvider] Failed to decode message as JSON or audio:', {
                  bufferSize: buffer.byteLength,
                  jsonError: jsonError instanceof Error ? jsonError.message : jsonError,
                  audioError: audioError instanceof Error ? audioError.message : audioError,
                });
              }
            }
          } else {
            // Handle other types (string, Blob, object, etc.)
            console.log('[CallProvider] Received message of type:', typeof event.data, 'value:', event.data);

            // First check if it's already a parsed object with phonecallStartTime
            if (
              typeof event.data === 'object' &&
              event.data !== null &&
              !(event.data instanceof ArrayBuffer) &&
              'phonecallStartTime' in event.data
            ) {
              console.log('[CallProvider] Call connected, starting audio (from object)');
              dispatch({ type: CallActions.CONNECT });
              startAudioStreaming(ws);
              return;
            }

            // Try to get the data as a string
            let textData: string | null = null;
            if (typeof event.data === 'string') {
              textData = event.data;
            } else if (
              event.data instanceof Blob ||
              (typeof event.data === 'object' && event.data !== null && '_data' in event.data)
            ) {
              // Handle Blob (including React Native Blob format with _data property)
              // React Native Blobs may not have standard methods, so we need to handle them differently
              const blob = event.data;

              // For React Native Blobs, try to use the data property directly if available
              if (typeof blob === 'object' && blob !== null && 'data' in blob && typeof blob.data === 'object') {
                // React Native Blob might have data accessible directly
                try {
                  // Try to access the underlying data
                  const blobData = (blob as any).data;
                  if (blobData && typeof blobData === 'string') {
                    const data = JSON.parse(blobData);
                    if (data.phonecallStartTime) {
                      console.log('[CallProvider] Call connected, starting audio (from Blob.data)');
                      dispatch({ type: CallActions.CONNECT });
                      startAudioStreaming(ws);
                      return;
                    }
                  }
                } catch (e) {
                  console.warn('[CallProvider] Failed to access Blob.data directly', e);
                }
              }

              // Try standard Blob methods if available
              if ('text' in blob && typeof blob.text === 'function') {
                blob
                  .text()
                  .then((text: string) => {
                    console.log('[CallProvider] Received Blob message, decoded as text:', text.substring(0, 100));
                    try {
                      const data = JSON.parse(text);
                      if (data.phonecallStartTime) {
                        console.log('[CallProvider] Call connected, starting audio');
                        dispatch({ type: CallActions.CONNECT });
                        startAudioStreaming(ws);
                      }
                    } catch (e) {
                      console.warn('[CallProvider] Failed to parse Blob message as JSON', e);
                    }
                  })
                  .catch((error: Error) => {
                    console.warn('[CallProvider] Failed to read Blob as text', error);
                  });
              } else if ('arrayBuffer' in blob && typeof blob.arrayBuffer === 'function') {
                blob.arrayBuffer().then((buffer: ArrayBuffer) => {
                  const bufferToString = (buf: ArrayBuffer): string => {
                    const bytes = new Uint8Array(buf);
                    let str = '';
                    for (let i = 0; i < bytes.length; i++) {
                      str += String.fromCharCode(bytes[i]);
                    }
                    return str;
                  };
                  try {
                    const text = bufferToString(buffer);
                    const data = JSON.parse(text);
                    if (data.phonecallStartTime) {
                      console.log('[CallProvider] Call connected, starting audio');
                      dispatch({ type: CallActions.CONNECT });
                      startAudioStreaming(ws);
                    }
                  } catch (e) {
                    console.warn('[CallProvider] Failed to parse Blob message', e);
                  }
                });
              } else {
                console.error(
                  '[CallProvider] Blob does not support text() or arrayBuffer(), and data property not accessible',
                  event.data,
                );
              }
              return;
            } else if (typeof event.data === 'object' && event.data !== null) {
              // Try to stringify if it's an object
              try {
                textData = JSON.stringify(event.data);
              } catch (e) {
                console.warn('[CallProvider] Could not stringify message data', e);
              }
            }

            // Try to parse as JSON if we have text data
            if (textData) {
              try {
                const data = JSON.parse(textData);
                if (data.phonecallStartTime) {
                  console.log('[CallProvider] Call connected, starting audio');
                  dispatch({ type: CallActions.CONNECT });
                  startAudioStreaming(ws);
                }
              } catch (e) {
                console.warn(
                  '[CallProvider] Failed to parse socket message as JSON',
                  e,
                  'textData:',
                  textData?.substring(0, 100),
                );
              }
            } else {
              console.warn('[CallProvider] Unhandled message type:', typeof event.data, event.data);
            }
          }
        });

        ws.addEventListener('close', event => {
          const closeInfo = {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
            readyState: ws.readyState,
            socketOpened: socketOpenedRef.current,
            timeSinceCreation: Date.now() - socketCreatedTime,
          };
          console.log('[CallProvider] Phone call socket closed', closeInfo);

          // If socket closed before opening, or closed very quickly after opening, it's likely a rejection
          // Even if it's a "clean" close (code 1000), a server can reject during handshake with 1000
          const timeSinceCreation = Date.now() - socketCreatedTime;
          const closedBeforeOpening = !socketOpenedRef.current;
          const closedQuickly = timeSinceCreation < 5000;

          // Check for specific error codes that indicate call rejection
          // 1008 = Policy Violation (often used for auth/validation failures)
          // 1002 = Protocol Error
          // 1006 = Abnormal Closure (no close frame received)
          // 1000 = Normal Closure
          // 1001 = Going Away (can be normal, especially if socket was open and working)
          // Only treat as error if it's a clear error code, or if wasClean is false AND it closed quickly AND socket never opened
          const isClearError =
            event.code === 1002 ||
            event.code === 1006 ||
            event.code === 1008 ||
            (event.code >= 4000 && event.code < 5000);
          // Code 1000/1001 with wasClean: false that happens quickly before socket opens is likely an error
          // But if socket was open and working, code 1001 might be normal (server going away, network issue, etc.)
          const isUncleanNormalClose = !event.wasClean && (event.code === 1000 || event.code === 1001);
          const isErrorClose = isClearError || (isUncleanNormalClose && closedQuickly && !socketOpenedRef.current);
          const isLikelyRejection = closedBeforeOpening || (closedQuickly && isErrorClose);

          // Show error message if this looks like a rejection
          // Check state.currentCall before dispatch to ensure we have the call info
          const currentCall = state.currentCall;
          console.log(
            '[CallProvider] Close handler - isLikelyRejection:',
            isLikelyRejection,
            'currentCall:',
            !!currentCall,
            'closedBeforeOpening:',
            closedBeforeOpening,
          );

          if (isLikelyRejection && currentCall) {
            const callDuration = currentCall.startTime ? Date.now() - currentCall.startTime.getTime() : 0;

            // If call ended within 5 seconds or never started (startTime is null), it's likely a rejection
            if (!currentCall.startTime || callDuration < 5000) {
              let errorMessage = 'Call failed. ';
              if (event.reason) {
                errorMessage += event.reason;
              } else if (closedBeforeOpening) {
                errorMessage +=
                  'Connection rejected. User may not be available, may have blocked you, or may not have favorited you.';
              } else if (event.code === 1008) {
                errorMessage += 'User may not be available, may have blocked you, or may not have favorited you.';
              } else if (event.code === 1002) {
                errorMessage += 'Connection error. Please try again.';
              } else if (event.code === 1006) {
                errorMessage += 'Connection lost. Please try again.';
              } else {
                errorMessage += `Error code: ${event.code}`;
              }

              console.error(
                '[CallProvider] Call rejected by server:',
                event.reason || `Close code: ${event.code}`,
                closeInfo,
              );
              // Show snackbar error - use setTimeout to ensure it shows after state update
              setTimeout(() => {
                setSnackbarPayload({ message: errorMessage, messageType: 'error' });
              }, 100);
            }
          } else if (isLikelyRejection && !currentCall) {
            // Call was rejected but currentCall is already null - show error anyway
            let errorMessage =
              'Call failed. Connection rejected. User may not be available, may have blocked you, or may not have favorited you.';
            console.error(
              '[CallProvider] Call rejected by server (no currentCall):',
              event.reason || `Close code: ${event.code}`,
              closeInfo,
            );
            setTimeout(() => {
              setSnackbarPayload({ message: errorMessage, messageType: 'error' });
            }, 100);
          }

          stopAudioStreaming();
          dispatch({ type: CallActions.END });
        });

        ws.addEventListener('error', error => {
          // Check if socket is already closing/closed - if so, this is likely a normal close event
          // WebSocket error events can fire during normal closures in React Native
          if (ws.readyState === WebSocket.CLOSING || ws.readyState === WebSocket.CLOSED) {
            console.log('[CallProvider] Phone call socket error during close (expected)');
            return;
          }
          // Only log as error if socket is still open/connecting
          console.error('[CallProvider] Phone call socket error', error);
          stopAudioStreaming();
          dispatch({ type: CallActions.END });
        });

        await answerMutation.mutateAsync({ callID });
      } catch (error) {
        console.error('[CallProvider] Failed to answer call', error);
        dispatch({ type: CallActions.END });
      }
    },
    [state.currentCall, answerMutation, startAudioStreaming, stopAudioStreaming, setSnackbarPayload],
  );

  const declineCall = useCallback(
    async (callID: string) => {
      try {
        await declineMutation.mutateAsync({ callID });
      } catch (error) {
        console.error('[CallProvider] Failed to decline call', error);
      } finally {
        dispatch({ type: CallActions.DECLINE });
      }
    },
    [declineMutation],
  );

  const endCall = useCallback(async () => {
    if (state.currentCall?.phoneSocket) {
      state.currentCall.phoneSocket.close();
    }

    if (state.currentCall?.callID) {
      try {
        await declineMutation.mutateAsync({ callID: state.currentCall.callID });
      } catch (error) {
        console.error('[CallProvider] Failed to end call', error);
      }
    }

    // Stop audio streaming
    await stopAudioStreaming();

    // Dismiss foreground notification on Android
    if (Platform.OS === 'android') {
      await dismissCallForegroundNotification();
    }

    dispatch({ type: CallActions.END });
  }, [state.currentCall, declineMutation, stopAudioStreaming]);

  const toggleMute = useCallback(async () => {
    const newMutedState = !state.isMuted;
    dispatch({ type: CallActions.TOGGLE_MUTE });

    // Update native audio engine
    if (audioEngineRef.current) {
      try {
        await audioEngineRef.current.setMuted(newMutedState);
      } catch (error) {
        console.error('[CallProvider] Failed to toggle mute:', error);
      }
    }
  }, [state.isMuted]);

  const toggleSpeaker = useCallback(async () => {
    const newSpeakerState = !state.isSpeakerOn;
    dispatch({ type: CallActions.TOGGLE_SPEAKER });

    // Update native audio engine
    if (audioEngineRef.current) {
      try {
        await audioEngineRef.current.setSpeakerOn(newSpeakerState);
      } catch (error) {
        console.error('[CallProvider] Failed to toggle speaker:', error);
      }
    }
  }, [state.isSpeakerOn]);

  // Duration timer and foreground notification updates
  useEffect(() => {
    if (state.state === CallState.ACTIVE && state.currentCall) {
      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        if (state.currentCall?.startTime) {
          const duration = Math.floor((Date.now() - state.currentCall.startTime.getTime()) / 1000);
          dispatch({ type: CallActions.UPDATE_DURATION, payload: duration });
        }
      }, 1000);

      // Show foreground notification on Android when call becomes active
      if (Platform.OS === 'android') {
        showCallForegroundNotification(state.currentCall.remoteUser, state.duration, state.isMuted).catch(
          console.error,
        );

        // Update notification every second with current duration and mute state
        notificationUpdateIntervalRef.current = setInterval(() => {
          if (state.currentCall) {
            updateCallForegroundNotification(state.currentCall.remoteUser, state.duration, state.isMuted).catch(
              console.error,
            );
          }
        }, 1000);
      }
    } else {
      // Clean up intervals
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      if (notificationUpdateIntervalRef.current) {
        clearInterval(notificationUpdateIntervalRef.current);
        notificationUpdateIntervalRef.current = null;
      }

      // Dismiss notification when call ends
      if (state.state === CallState.ENDED && Platform.OS === 'android') {
        dismissCallForegroundNotification().catch(console.error);
      }
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (notificationUpdateIntervalRef.current) {
        clearInterval(notificationUpdateIntervalRef.current);
      }
    };
  }, [state.state, state.currentCall, state.duration, state.isMuted]);

  // Update notification when mute state changes
  useEffect(() => {
    if (state.state === CallState.ACTIVE && state.currentCall && Platform.OS === 'android') {
      updateCallForegroundNotification(state.currentCall.remoteUser, state.duration, state.isMuted).catch(
        console.error,
      );
    }
  }, [state.isMuted, state.state, state.currentCall, state.duration]);

  // Handle app state changes (background/foreground)
  useEffect(() => {
    if (state.state === CallState.ACTIVE && state.currentCall) {
      if (appState === 'background' || appState === 'inactive') {
        // App is backgrounded - ensure foreground notification is showing
        if (Platform.OS === 'android') {
          showCallForegroundNotification(state.currentCall.remoteUser, state.duration, state.isMuted).catch(
            console.error,
          );
        }
      }
    }
  }, [appState, state.state, state.currentCall, state.duration, state.isMuted]);

  const value = {
    currentCall: state.currentCall,
    callState: state.state,
    isMuted: state.isMuted,
    isSpeakerOn: state.isSpeakerOn,
    callDuration: state.duration,
    initiateCall,
    receiveCall,
    answerCall,
    declineCall,
    endCall,
    toggleMute,
    toggleSpeaker,
  };

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
};
