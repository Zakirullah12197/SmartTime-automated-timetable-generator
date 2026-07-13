import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router';
import { store } from './store';
import { router } from './routes';
import { ThemeProvider } from './components/smarttime/ThemeContext';
export default function App() {
    return (<Provider store={store}>
      <ThemeProvider>
        <RouterProvider router={router}/>
      </ThemeProvider>
    </Provider>);
}
