
import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("MiniVerse React Error:", error);
    console.error("Component Stack:", errorInfo.componentStack);

    // TODO: Send errors to your monitoring service
    // in production, without exposing sensitive data.
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-5 text-white">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-8 text-center shadow-2xl">

            <div className="mb-5 text-5xl">
              🎮
            </div>

            <h1 className="mb-3 text-2xl font-bold">
              Something went wrong
            </h1>

            <p className="mb-7 text-sm leading-6 text-slate-400">
              MiniVerse encountered an unexpected error.
              You can try again or reload the application.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <pre className="mb-6 max-h-40 overflow-auto rounded-lg bg-black/40 p-3 text-left text-xs text-red-300">
                {this.state.error.message}
              </pre>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">

              <button
                type="button"
                onClick={this.handleRetry}
                className="flex-1 rounded-lg bg-violet-600 px-5 py-3 text-sm font-semibold transition hover:bg-violet-500"
              >
                Try Again
              </button>

              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 rounded-lg border border-white/10 px-5 py-3 text-sm font-semibold transition hover:bg-white/10"
              >
                Reload App
              </button>

            </div>

            <p className="mt-6 text-xs text-slate-500">
              MiniVerse Gaming Platform
            </p>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
