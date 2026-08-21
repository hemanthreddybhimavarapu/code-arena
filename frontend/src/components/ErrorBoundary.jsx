import React from 'react';
import { AlertTriangle, RotateCcw, ArrowLeft } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  handleGoBack = () => {
    window.location.href = '/problems';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[calc(100vh-73px)] w-full flex items-center justify-center bg-darkBg text-white p-6">
          <div className="glass-panel p-8 rounded-2xl max-w-lg w-full text-center space-y-5 border border-red-500/20 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-white font-outfit">Workspace Render Error</h3>
              <p className="text-xs text-gray-400 font-sans">
                An unexpected component rendering error occurred. We have prevented a blank screen crash.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-black/50 border border-white/10 rounded-xl text-left font-mono text-[11px] text-red-300 max-h-32 overflow-y-auto whitespace-pre-wrap">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-5 py-2.5 bg-primaryBlue hover:bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
              >
                <RotateCcw className="w-4 h-4" /> Try Reloading Workspace
              </button>
              
              <button
                onClick={this.handleGoBack}
                className="w-full sm:w-auto px-5 py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Problems
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
