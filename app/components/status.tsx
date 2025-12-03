import {useZeroConnectionState} from '@rocicorp/zero/react';

export function Status() {
  const state = useZeroConnectionState();
  switch (state.name) {
    case 'connecting': {
      return <div title={state.reason}>🔄 Connecting...</div>;
    }
    case 'connected': {
      return <div>✅ Connected</div>;
    }
    case 'disconnected': {
      return <div title={state.reason}>🦕 Offline</div>;
    }
    case 'error': {
      return <div title={state.reason}>❌ Error</div>;
    }
    case 'needs-auth': {
      return <div>🔐 Session expired</div>;
    }
    default: {
      throw new Error('Unexpected connection state: ' + state.name);
    }
  }
}
