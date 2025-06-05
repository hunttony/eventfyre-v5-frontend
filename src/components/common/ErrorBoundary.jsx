import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 rounded-lg">
          <h2 className="text-lg font-medium text-red-800">Something went wrong</h2>
          <p className="mt-2 text-red-700">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          {this.props.onRetry && (
            <button
              onClick={this.handleRetry}
              className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
            >
              Try Again
            </button>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
