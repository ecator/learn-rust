import { type RouteObject } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Home } from '@/routes/Home';
import { Curriculum } from '@/routes/Curriculum';
import { LessonPage } from '@/routes/LessonPage';
import { VisualizersGallery } from '@/routes/VisualizersGallery';
import { ProgressPage } from '@/routes/ProgressPage';
import { NotFound } from '@/routes/NotFound';

export const routesConfig: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'curriculum',
        element: <Curriculum />,
      },
      {
        path: 'lesson/:slug',
        element: <LessonPage />,
      },
      {
        path: 'lessons/:slug',
        element: <LessonPage />,
      },
      {
        path: 'visualizers',
        element: <VisualizersGallery />,
      },
      {
        path: 'progress',
        element: <ProgressPage />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
];
