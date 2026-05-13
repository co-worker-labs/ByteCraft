"use client";

import { useRef, useState, type DragEvent } from "react";

export function useMultiFileDrop(onFiles: (files: File[]) => void) {
  const [isDragging, setIsDragging] = useState(false);
  const counterRef = useRef(0);

  function onDragOver(ev: DragEvent) {
    ev.preventDefault();
    ev.stopPropagation();
    ev.dataTransfer.dropEffect = "copy";
  }

  function onDragEnter(ev: DragEvent) {
    ev.preventDefault();
    ev.stopPropagation();
    counterRef.current++;
    if (ev.dataTransfer.types.includes("Files")) {
      setIsDragging(true);
    }
  }

  function onDragLeave(ev: DragEvent) {
    ev.preventDefault();
    ev.stopPropagation();
    counterRef.current--;
    if (counterRef.current === 0) {
      setIsDragging(false);
    }
  }

  function onDrop(ev: DragEvent) {
    ev.preventDefault();
    ev.stopPropagation();
    counterRef.current = 0;
    setIsDragging(false);
    const fileArray = Array.from(ev.dataTransfer.files ?? []);
    if (fileArray.length > 0) onFiles(fileArray);
  }

  return { isDragging, onDragOver, onDragEnter, onDragLeave, onDrop };
}
