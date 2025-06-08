import {Cart} from './cart';
import {LoginButton} from './login-button';

export function SiteLayout({children}: {children: React.ReactNode}) {
  return (
    <div style={{padding: '10px 5px'}}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
          marginBottom: 10,
        }}
      >
        <img src="/logo.png" alt="logo" style={{height: 100}} />
        <div style={{flex: 1}} />
        <Cart />
        <LoginButton />
      </div>
      {children}
    </div>
  );
}
