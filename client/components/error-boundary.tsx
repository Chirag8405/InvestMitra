import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Props = { children: React.ReactNode };

type State = { hasError: boolean; error?: Error };

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
    this.reset = this.reset.bind(this);
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("UI ErrorBoundary caught an error", error, errorInfo);
  }

  reset() {
    this.setState({ hasError: false, error: undefined });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
            <CardContent className="p-8 text-center space-y-4">
              <h2 className="text-2xl font-semibold">Something went wrong</h2>
              <p className="text-muted-foreground">An unexpected error occurred while rendering this section.</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={this.reset}>Try Again</Button>
                <Button variant="outline" onClick={() => (window.location.href = "/")}>Go Home</Button>
              </div>
              {this.state.error && (
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-words mt-2">
                  {this.state.error.message}
                </pre>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}
