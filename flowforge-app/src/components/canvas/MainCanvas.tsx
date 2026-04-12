"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Stage, Layer, Image as KonvaImage, Rect, Text, Group } from "react-konva";
// Simple custom hook for image loading since use-image cannot be installed
function useImage(url: string) {
  const [image, setImage] = useState<HTMLImageElement | undefined>(undefined);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'failed'>('loading');

  useEffect(() => {
    if (!url) return;
    const img = new window.Image();
    img.onload = () => {
      setImage(img);
      setStatus('loaded');
    };
    img.onerror = () => {
      setStatus('failed');
    };
    img.src = url;
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [url]);

  return [image, status] as const;
}
import Konva from "konva";

interface Annotation {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
}

interface MainCanvasProps {
  imageUrl: string;
  frameName: string;
  annotations?: Annotation[];
  selectedAnnotationId?: string | null;
  onAnnotationClick?: (id: string) => void;
  onZoomChange?: (zoom: number) => void;
  onNextScreen?: () => void;
  onPrevScreen?: () => void;
  toolMode?: "select" | "draw" | "zoom";
  showAnnotations?: boolean;
}

const ZOOM_SPEED = 1.1;
const ZOOM_FINE_SPEED = 1.02;

export default function MainCanvas({
  imageUrl,
  frameName,
  annotations = [],
  selectedAnnotationId,
  onAnnotationClick,
  onZoomChange,
  onNextScreen,
  onPrevScreen,
  toolMode = "select",
  showAnnotations = true,
}: MainCanvasProps) {
  const [image, status] = useImage(imageUrl);
  const stageRef = useRef<Konva.Stage>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Drawing state
  const [newAnnotation, setNewAnnotation] = useState<any>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Update dimensions on mount and resize
  useEffect(() => {
    const updateDimensions = () => {
      if (typeof window !== "undefined") {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Zoom to fit image on load
  useEffect(() => {
    if (status === 'loaded' && image && dimensions.width > 0) {
      const padding = 40;
      const availableWidth = dimensions.width - padding * 2;
      const availableHeight = dimensions.height - padding * 2;
      
      const scaleX = availableWidth / image.width;
      const scaleY = availableHeight / image.height;
      const newScale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond 1:1

      setScale(newScale);
      setPosition({
        x: (dimensions.width - image.width * newScale) / 2,
        y: (dimensions.height - image.height * newScale) / 2,
      });
      onZoomChange?.(Math.round(newScale * 100));
    }
  }, [image, status, dimensions, onZoomChange]);

  // Handle zooming with mouse wheel
  const handleWheel = useCallback((e: any) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const isFine = e.evt.ctrlKey || e.evt.metaKey;
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const speed = isFine ? ZOOM_FINE_SPEED : ZOOM_SPEED;
    
    const newScale = direction > 0 ? oldScale * speed : oldScale / speed;

    setScale(newScale);
    setPosition({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
    onZoomChange?.(Math.round(newScale * 100));
  }, [onZoomChange]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "[" ) onPrevScreen?.();
      if (e.key === "]" ) onNextScreen?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onNextScreen, onPrevScreen]);

  const handleMouseDown = (e: any) => {
    if (e.evt.button === 1 || e.evt.code === "Space" || e.evt.which === 2) {
      setIsPanning(true);
      return;
    }

    if (toolMode === "draw") {
      const stage = e.target.getStage();
      const pointer = stage.getPointerPosition();
      const startX = (pointer.x - stage.x()) / stage.scaleX();
      const startY = (pointer.y - stage.y()) / stage.scaleY();
      
      setNewAnnotation({
        x: startX,
        y: startY,
        width: 0,
        height: 0,
      });
      setIsDrawing(true);
    }
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing || toolMode !== "draw") return;

    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    const currentX = (pointer.x - stage.x()) / stage.scaleX();
    const currentY = (pointer.y - stage.y()) / stage.scaleY();

    setNewAnnotation((prev: any) => ({
      ...prev,
      width: currentX - prev.x,
      height: currentY - prev.y,
    }));
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    if (isDrawing) {
      setIsDrawing(false);
      // In a real app, we'd trigger the DrawDialog here
      console.log("Finished drawing:", newAnnotation);
    }
  };

  return (
    <div className="w-full h-full bg-[#111111] overflow-hidden relative cursor-crosshair">
      {/* Zoom indicator */}
      <div className="absolute top-4 right-4 z-50 px-2 py-1 rounded bg-black/50 text-white text-[10px] font-mono">
        {Math.round(scale * 100)}%
      </div>

      {/* Screen name indicator */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-3 py-1 rounded-full bg-black/50 text-white text-[11px] font-medium border border-white/10">
        {frameName}
      </div>

      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        onWheel={handleWheel}
        onMouseMove={handleMouseMove}
        draggable={isPanning}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        <Layer>
          {/* Background grid/dots could go here */}
          {status === 'loaded' && image && image.width > 0 && image.height > 0 && (
            <KonvaImage
              image={image}
              width={image.width}
              height={image.height}
              shadowBlur={20}
              shadowOpacity={0.5}
              shadowColor="black"
              cornerRadius={8}
            />
          )}
        </Layer>
        <Layer>
          {/* Annotations Layer */}
          {showAnnotations && annotations.map((ann) => {
            const isSelected = selectedAnnotationId === ann.id;
            const isHovered = hoveredId === ann.id;
            const color = ann.color || "#3b82f6";
            
            return (
              <Group
                key={ann.id}
                onClick={() => onAnnotationClick?.(ann.id)}
                onMouseEnter={() => setHoveredId(ann.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <Rect
                  x={ann.x}
                  y={ann.y}
                  width={ann.width}
                  height={ann.height}
                  fill={color}
                  opacity={isSelected ? 0.3 : isHovered ? 0.2 : 0.15}
                  stroke={color}
                  strokeWidth={isSelected ? 3 : 2}
                  dash={isSelected ? [] : [4, 4]}
                  cornerRadius={4}
                />
                {(isSelected || isHovered) && (
                  <Group x={ann.x} y={ann.y - 25}>
                    <Rect
                      width={ann.label.length * 8 + 20}
                      height={20}
                      fill={color}
                      cornerRadius={4}
                    />
                    <Text
                      text={ann.label}
                      fill="white"
                      padding={5}
                      fontSize={10}
                      fontStyle="bold"
                    />
                  </Group>
                )}
              </Group>
            );
          })}

          {/* New Annotation being drawn */}
          {isDrawing && newAnnotation && (
            <Rect
              x={newAnnotation.x}
              y={newAnnotation.y}
              width={newAnnotation.width}
              height={newAnnotation.height}
              stroke="#18e299"
              strokeWidth={2}
              dash={[4, 4]}
              opacity={0.5}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}
