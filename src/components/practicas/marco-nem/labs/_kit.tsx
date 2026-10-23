"use client";

import { Component, type ReactNode } from "react";

/** Si la escena 3D falla (WebGL), pinta el respaldo en lugar de romper la página. */
export class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
