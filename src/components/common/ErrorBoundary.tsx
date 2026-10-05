import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  fallback?: ReactNode
  children: ReactNode
}

interface State {
  failed: boolean
}

// If an effect (3D, shader, texture) fails, show the fallback instead of a blank page
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('Scene failed, showing fallback', error, info.componentStack)
  }

  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children
  }
}
