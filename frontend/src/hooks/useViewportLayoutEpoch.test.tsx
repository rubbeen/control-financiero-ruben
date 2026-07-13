import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useViewportLayoutEpoch from './useViewportLayoutEpoch';

class TestVisualViewport extends EventTarget {
  width = 360;
  height = 800;
  scale = 1;
}

describe('useViewportLayoutEpoch', () => {
  const viewport = new TestVisualViewport();
  const frames = new Map<number, FrameRequestCallback>();
  let frameId = 0;
  let originalVisualViewport: PropertyDescriptor | undefined;

  const flushFrame = () => {
    const scheduled = [...frames.values()];
    frames.clear();
    act(() => scheduled.forEach((callback) => callback(performance.now())));
  };

  beforeEach(() => {
    viewport.width = 360;
    viewport.height = 800;
    frames.clear();
    frameId = 0;
    originalVisualViewport = Object.getOwnPropertyDescriptor(window, 'visualViewport');
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport });
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frameId += 1;
      frames.set(frameId, callback);
      return frameId;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => { frames.delete(id); });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    if (originalVisualViewport) Object.defineProperty(window, 'visualViewport', originalVisualViewport);
    else Reflect.deleteProperty(window, 'visualViewport');
  });

  it('increments once per real geometry change and cleans every listener', () => {
    const windowAdd = vi.spyOn(window, 'addEventListener');
    const windowRemove = vi.spyOn(window, 'removeEventListener');
    const viewportAdd = vi.spyOn(viewport, 'addEventListener');
    const viewportRemove = vi.spyOn(viewport, 'removeEventListener');
    const { result, unmount } = renderHook(() => useViewportLayoutEpoch());

    act(() => {
      viewport.width = 800;
      viewport.height = 360;
      window.dispatchEvent(new Event('resize'));
      window.dispatchEvent(new Event('orientationchange'));
      viewport.dispatchEvent(new Event('resize'));
    });
    expect(frames).toHaveLength(1);
    flushFrame();
    flushFrame();
    expect(result.current).toBe(1);

    act(() => {
      window.dispatchEvent(new Event('resize'));
      viewport.dispatchEvent(new Event('resize'));
    });
    flushFrame();
    flushFrame();
    expect(result.current).toBe(1);

    expect(windowAdd.mock.calls.filter(([name]) => name === 'resize')).toHaveLength(1);
    expect(windowAdd.mock.calls.filter(([name]) => name === 'orientationchange')).toHaveLength(1);
    expect(viewportAdd.mock.calls.filter(([name]) => name === 'resize')).toHaveLength(1);

    unmount();
    expect(windowRemove.mock.calls.filter(([name]) => name === 'resize')).toHaveLength(1);
    expect(windowRemove.mock.calls.filter(([name]) => name === 'orientationchange')).toHaveLength(1);
    expect(viewportRemove.mock.calls.filter(([name]) => name === 'resize')).toHaveLength(1);
    expect(frames).toHaveLength(0);
  });
});
