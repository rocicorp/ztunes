import {Cart} from './cart';
import {LoginButton} from './login-button';
import {Link} from './link';
import {Status} from './status';

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
        <Link to="/">
          <img src="/logo-adc6d1a1.png" alt="logo" style={{height: 100}} />
        </Link>
        <div style={{flex: 1}} />
        <Cart />
        <LoginButton />
        <Status />
      </div>
      {children}
    </div>
  );
}
