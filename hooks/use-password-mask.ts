"use client";

import { useState, useRef, useEffect, useCallback } from "react";

type Sel = { start: number; end: number };

/**
 * usePasswordMask
 *
 * Renders `*` per character in the input when `show=false`, keeping
 * the real password in state. Uses type="text" so the browser renders
 * actual `*` glyphs (not `•` dots).
 *
 * Usage:
 *   const mask = usePasswordMask(showPassword);
 *   <input ref={mask.inputRef} {...mask.inputProps} autoComplete="new-password" />
 *   // use mask.password for the actual value
 *   // call mask.setPassword("") to reset
 */
export function usePasswordMask(show: boolean) {
  const [password, setPasswordState] = useState("");
  const selRef = useRef<Sel>({ start: 0, end: 0 });
  const pendingCursorRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // After every render, restore cursor to where we expect it (masked mode only)
  useEffect(() => {
    if (!show && pendingCursorRef.current !== null && inputRef.current) {
      const pos = pendingCursorRef.current;
      inputRef.current.setSelectionRange(pos, pos);
      pendingCursorRef.current = null;
    }
  });

  const captureSelection = (el: HTMLInputElement) => {
    selRef.current = {
      start: el.selectionStart ?? 0,
      end: el.selectionEnd ?? 0,
    };
  };

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      captureSelection(e.currentTarget);
    },
    []
  );

  const onMouseUp = useCallback(
    (e: React.MouseEvent<HTMLInputElement>) => {
      captureSelection(e.currentTarget);
    },
    []
  );

  const onPaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      if (show) return; // let browser + onChange handle it in reveal mode
      e.preventDefault();
      const text = e.clipboardData.getData("text").replace(/\s/g, "");
      if (!text) return;
      const { start, end } = selRef.current;
      setPasswordState((prev) => {
        const next = prev.slice(0, start) + text + prev.slice(end);
        pendingCursorRef.current = start + text.length;
        return next;
      });
    },
    [show]
  );

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (show) {
        // Reveal mode — input value IS the real password
        setPasswordState(e.target.value.replace(/\s/g, ""));
        return;
      }

      const inputEvent = e.nativeEvent as InputEvent;
      const { start, end } = selRef.current;

      setPasswordState((prev) => {
        let next = prev;
        let cursor = start;

        switch (inputEvent.inputType) {
          case "insertText":
          case "insertCompositionText":
          case "insertReplacementText": {
            const char = (inputEvent.data ?? "").replace(/\s/g, "");
            if (!char) return prev;
            next = prev.slice(0, start) + char + prev.slice(end);
            cursor = start + char.length;
            break;
          }
          case "deleteContentBackward": {
            if (start !== end) {
              next = prev.slice(0, start) + prev.slice(end);
              cursor = start;
            } else if (start > 0) {
              next = prev.slice(0, start - 1) + prev.slice(start);
              cursor = start - 1;
            }
            break;
          }
          case "deleteContentForward": {
            if (start !== end) {
              next = prev.slice(0, start) + prev.slice(end);
              cursor = start;
            } else if (start < prev.length) {
              next = prev.slice(0, start) + prev.slice(start + 1);
              cursor = start;
            }
            break;
          }
          case "deleteByCut":
          case "deleteContent": {
            next = prev.slice(0, start) + prev.slice(end);
            cursor = start;
            break;
          }
          case "deleteWordBackward": {
            if (start !== end) {
              next = prev.slice(0, start) + prev.slice(end);
              cursor = start;
            } else {
              let i = start;
              while (i > 0 && !/\s/.test(prev[i - 1])) i--;
              next = prev.slice(0, i) + prev.slice(start);
              cursor = i;
            }
            break;
          }
          case "deleteWordForward": {
            if (start !== end) {
              next = prev.slice(0, start) + prev.slice(end);
              cursor = start;
            } else {
              let i = start;
              while (i < prev.length && !/\s/.test(prev[i])) i++;
              next = prev.slice(0, start) + prev.slice(i);
              cursor = start;
            }
            break;
          }
          default:
            return prev;
        }

        pendingCursorRef.current = cursor;
        return next;
      });
    },
    [show]
  );

  const setPassword = useCallback((value: string) => {
    setPasswordState(value);
  }, []);

  const displayValue = show ? password : "*".repeat(password.length);

  return {
    password,
    setPassword,
    inputRef,
    inputProps: {
      type: "text" as const,
      value: displayValue,
      onChange,
      onKeyDown,
      onMouseUp,
      onPaste,
    },
  };
}
