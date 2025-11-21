import React from 'react';

type State = { hasError: boolean; error?: Error | null };

export default class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(_error: Error, _info: any) {
    // You can log the error to an external service here
    // console.error(_error, _info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24 }}>
          <h1>Ha ocurrido un error en la aplicación</h1>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#f8d7da', padding: 12, borderRadius: 6 }}>
            {String(this.state.error)}
          </pre>
          <p>Para depuración en desarrollo ejecuta el frontend con Vite (`npm run dev`) y revisa la consola.</p>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}
