'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, Button } from '@/components/ui/core';
import { AlertTriangle, RefreshCw, Terminal, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught admin crash boundary error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[500px] flex items-center justify-center p-6 font-sans text-warm-white">
          <Card className="max-w-2xl w-full p-8 border border-accent-pink/20 bg-charcoal/20 backdrop-blur-md shadow-premium space-y-6">
            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
              <div className="w-12 h-12 rounded-xl bg-accent-pink/10 border border-accent-pink/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-accent-pink" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-semibold text-accent-pink tracking-[0.2em] uppercase font-mono">
                  Runtime Crash Guard
                </span>
                <h2 className="text-xl font-bold tracking-tight">An unexpected error crashed this panel</h2>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[13px] text-stone leading-relaxed font-light">
                The application encountered an execution boundary error. You can review the developer diagnostics logs below, attempt to re-hydrate the state, or return to the main dashboard.
              </p>

              {this.state.error && (
                <div className="rounded-xl border border-white/5 bg-onyx/60 p-4 font-mono text-[11px] text-stone space-y-2 overflow-x-auto max-h-[220px]">
                  <div className="flex items-center gap-1.5 text-accent-pink font-bold border-b border-white/5 pb-1">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Exception Diagnostics Log</span>
                  </div>
                  <div className="font-bold text-warm-white">{this.state.error.toString()}</div>
                  {this.state.errorInfo && (
                    <pre className="whitespace-pre text-left leading-relaxed mt-1 opacity-70">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-white/5 pt-4">
              <Link href="/admin">
                <Button variant="secondary" className="text-[11px] py-1.5 px-3 flex items-center gap-1.5">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Exit to Main Admin</span>
                </Button>
              </Link>

              <Button
                variant="primary"
                onClick={this.handleReset}
                className="text-[11px] py-1.5 px-4 flex items-center gap-1.5 font-bold uppercase tracking-wider bg-accent-pink border-accent-pink/40 hover:bg-accent-pink/80"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry State</span>
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
