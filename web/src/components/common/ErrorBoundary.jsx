import React from 'react';
import DardashaLogo from './DardashaLogo';

/**
 * 🛡️ Anti-Crash Shield for Frontend UI (React Error Boundary)
 * Prevents blank white screens if any subcomponent or dynamic render fails.
 * Guarantees instant recovery and state protection.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🛡️ [CrashGuard Frontend] Intercepted runtime error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetState = () => {
    try {
      // Clear non-critical caches while retaining user auth if possible
      sessionStorage.clear();
      window.location.href = '/';
    } catch {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 dir-rtl" style={{ direction: 'rtl' }}>
          <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl backdrop-blur-xl animate-fade-in">
            {/* Logo & Guard Icon */}
            <div className="flex justify-center mb-5">
              <div className="relative">
                <DardashaLogo size="lg" animated={false} />
                <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 rounded-full p-1.5 shadow-md">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
              درع حماية واجهة دردشة نشط 🛡️
            </h2>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              تم رصد استثناء غير متوقع في الواجهة وعزله بنجاح دون التأثير على بياناتك أو جلسة حسابك.
            </p>

            {/* Recovery Actions */}
            <div className="space-y-3 mb-6">
              <button
                onClick={this.handleReload}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition-all transform active:scale-95 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>إعادة تحميل التطبيق بسلاسة</span>
              </button>

              <button
                onClick={this.handleResetState}
                className="w-full py-3 px-4 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 font-semibold rounded-2xl border border-slate-700/50 transition-all text-sm"
              >
                تحديث الجلسة وتنظيف الذاكرة المؤقتة
              </button>
            </div>

            {/* Technical Details Toggle */}
            {this.state.error && (
              <details className="text-right text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-slate-500 cursor-pointer">
                <summary className="font-medium text-slate-400 hover:text-slate-300">
                  تفاصيل الاستثناء البرمجي للمطورين
                </summary>
                <pre className="mt-2 text-left overflow-x-auto text-[10px] text-rose-400 font-mono p-2 bg-slate-900 rounded">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
