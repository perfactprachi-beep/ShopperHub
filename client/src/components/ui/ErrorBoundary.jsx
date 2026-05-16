import { Component } from 'react';
import { Link } from 'react-router-dom';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(err, info) {
    console.error('ErrorBoundary caught:', err, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
          <h1 className="text-4xl font-bold text-[var(--color-primary)] mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
            Something went wrong
          </h1>
          <p className="text-[var(--color-muted)] mb-6">An unexpected error occurred. Please refresh the page.</p>
          <Link
            to="/"
            onClick={() => this.setState({ hasError: false })}
            className="px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-[var(--radius-sm)] hover:opacity-90 transition-opacity"
          >
            Go to Homepage
          </Link>
        </div>
      );
    }
    return this.props.children;
  }
}
