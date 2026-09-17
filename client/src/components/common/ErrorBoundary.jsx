import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/marketplace';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="card max-w-md w-full p-8 text-center border border-gray-200 shadow-xl space-y-4">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Something went wrong</h2>
            <p className="text-xs text-gray-500">
              An unexpected error occurred while rendering this page.
            </p>
            <button
              onClick={this.handleReload}
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 text-xs font-bold"
            >
              <RotateCcw className="w-4 h-4" /> Return to Marketplace
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
