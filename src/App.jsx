import { HashRouter, BrowserRouter, Routes, Route } from 'react-router-dom';
import Main from './components/Main';
import History from './components/History';
import Favorites from './components/Favorites';
import Settings from './components/Settings';
import { useTheme } from './hooks/useTheme';
import { useSkin } from './hooks/useSkin';
import './style.css';

// variant 'popup' renders as the fixed-size extension popup; variant 'web'
// renders full-page for the standalone site. Extension popups must use
// HashRouter since chrome-extension:// URLs can't use path routing.
// Both entry points (main.jsx, main.popup.jsx) pass this explicitly.
function App({ variant }) {
  // Applies the persisted/system theme class regardless of which route is
  // active — History doesn't render <Header> (where the toggle lives), so
  // this must run at this top level to guarantee the theme is always set.
  useTheme();
  useSkin();

  const Router = variant === 'web' ? BrowserRouter : HashRouter;
  const shellClassName =
    variant === 'web'
      ? 'max-w-md mx-auto py-8 px-4 classic:bg-[var(--classic-surface)]'
      : 'w-96 min-h-[450px] bg-white dark:bg-gray-900 classic:bg-[var(--classic-surface)] p-4 z-10 relative';

  return (
    <div className={shellClassName}>
      <Router>
        <Routes>
          <Route path='/' element={<Main />} />
          <Route path='/history' element={<History />} />
          <Route path='/favorites' element={<Favorites />} />
          <Route path='/settings' element={<Settings />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
