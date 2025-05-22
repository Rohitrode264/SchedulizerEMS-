import { Toaster as HotToaster } from 'react-hot-toast';

export const Toaster = () => {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        className: 'font-medium',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
        success: {
          style: {
            background: '#10B981',
            color: 'white',
          },
          iconTheme: {
            primary: 'white',
            secondary: '#10B981',
          },
        },
        error: {
          style: {
            background: '#EF4444',
            color: 'white',
          },
          iconTheme: {
            primary: 'white',
            secondary: '#EF4444',
          },
        },
        loading: {
          style: {
            background: '#6366F1',
            color: 'white',
          },
        },
      }}
    />
  );
};