import { createBrowserRouter } from 'react-router-dom';
import { routesConfig } from './routesConfig';

export const router = createBrowserRouter(routesConfig, {
  basename: import.meta.env.BASE_URL,
});

export { routesConfig };
