"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"

export function Wboard() {
  const [selectedTool, setSelectedTool] = useState("pencil")
  const [color, setColor] = useState("#000000")
  const [shapes, setShapes] = useState([])
  const [actionHistory, setActionHistory] = useState([])
  const [redoHistory, setRedoHistory] = useState([])
  const canvasRef = useRef(null)
  const ctxRef = useRef(null)
  const isDrawing = useRef(false)
  const startX = useRef(0)
  const startY = useRef(0)

  // Initialize canvas context
  const setupCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    ctxRef.current = ctx
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }

  const handleToolChange = (tool) => {
    setSelectedTool(tool)
  }

  const handleColorChange = (newColor) => {
    setColor(newColor)
  }

  const handleShapeAdd = (shape) => {
    const newShape = { type: shape, color, x: 100, y: 100, width: 100, height: 100 } // Example shape properties
    setShapes([...shapes, newShape])
    setActionHistory([...actionHistory, { action: 'add', shape: newShape }])
    setRedoHistory([])
    redrawCanvas()
  }

  const handleUndo = () => {
    if (actionHistory.length === 0) return
    const lastAction = actionHistory[actionHistory.length - 1]
    if (lastAction.action === 'add') {
      setShapes(shapes.slice(0, -1))
      setRedoHistory([...redoHistory, lastAction])
    }
    setActionHistory(actionHistory.slice(0, -1))
    redrawCanvas()
  }

  const handleRedo = () => {
    if (redoHistory.length === 0) return
    const lastRedo = redoHistory[redoHistory.length - 1]
    if (lastRedo.action === 'add') {
      setShapes([...shapes, lastRedo.shape])
      setActionHistory([...actionHistory, lastRedo])
    }
    setRedoHistory(redoHistory.slice(0, -1))
    redrawCanvas()
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    const link = document.createElement("a")
    link.href = canvas.toDataURL()
    link.download = "drawing.png"
    link.click()
  }

  const handleClear = () => {
    setShapes([])
    setActionHistory([])
    setRedoHistory([])
    redrawCanvas()
  }

  const redrawCanvas = () => {
    const ctx = ctxRef.current
    const canvas = canvasRef.current
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    shapes.forEach(shape => {
      ctx.beginPath()
      ctx.strokeStyle = shape.color
      if (shape.type === "rectangle") {
        ctx.rect(shape.x, shape.y, shape.width, shape.height)
      } else if (shape.type === "circle") {
        ctx.arc(shape.x, shape.y, shape.width / 2, 0, Math.PI * 2)
      } else if (shape.type === "triangle") {
        ctx.moveTo(shape.x, shape.y)
        ctx.lineTo(shape.x + shape.width, shape.y)
        ctx.lineTo(shape.x + shape.width / 2, shape.y + shape.height)
        ctx.closePath()
      }
      ctx.stroke()
    })
  }

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    isDrawing.current = true
    startX.current = x
    startY.current = y

    if (selectedTool === "eraser") {
      ctx.globalCompositeOperation = 'destination-out'
    } else {
      ctx.globalCompositeOperation = 'source-over'
      ctx.beginPath()
      ctx.moveTo(x, y)
    }
  }

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (!isDrawing.current) return

    if (selectedTool === "pencil") {
      ctx.lineTo(x, y)
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.stroke()
    } else if (selectedTool === "eraser") {
      ctx.clearRect(x - 10, y - 10, 30, 30) // Erase a 20x20 area
    }
  }

  const handleMouseUp = () => {
    isDrawing.current = false
    const ctx = ctxRef.current

    if (selectedTool === "pencil") {
      const newShape = {
        type: 'pencilStroke', // Custom type for pencil strokes
        color,
        x: startX.current,
        y: startY.current,
        width: ctx.lineWidth,
        height: 0
      }
      setShapes([...shapes, newShape])
      setActionHistory([...actionHistory, { action: 'add', shape: newShape }])
      setRedoHistory([])
    }
  }

  useEffect(() => {
    setupCanvas()
  }, [])

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-background border-b p-2 flex items-center justify-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleToolChange("pencil")}
          className={selectedTool === "pencil" ? "bg-muted" : ""}
        >
          <PencilIcon className="h-5 w-5" />
          <span className="sr-only">Pencil</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleToolChange("eraser")}
          className={selectedTool === "eraser" ? "bg-muted" : ""}
        >
          <EraserIcon className="h-5 w-5" />
          <span className="sr-only">Eraser</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <ShapesIcon className="h-5 w-5" />
              <span className="sr-only">Shapes</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleShapeAdd("rectangle")}>
              <RectangleVerticalIcon className="h-4 w-4 mr-2" />
              Rectangle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShapeAdd("circle")}>
              <CircleIcon className="h-4 w-4 mr-2" />
              Circle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShapeAdd("triangle")}>
              <TriangleIcon className="h-4 w-4 mr-2" />
              Triangle
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Separator orientation="vertical" className="h-6" />
        <div />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleColorChange("#000000")}
          className={color === "#000000" ? "bg-muted" : ""}
        >
          <div className="w-5 h-5 bg-black rounded-full" />
          <span className="sr-only">Black</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleColorChange("#ffffff")}
          className={color === "#ffffff" ? "bg-muted" : ""}
        >
          <div className="w-5 h-5 bg-white rounded-full border" />
          <span className="sr-only">White</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleColorChange("#ff0000")}
          className={color === "#ff0000" ? "bg-muted" : ""}
        >
          <div className="w-5 h-5 bg-red-500 rounded-full" />
          <span className="sr-only">Red</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleColorChange("#00ff00")}
          className={color === "#00ff00" ? "bg-muted" : ""}
        >
          <div className="w-5 h-5 bg-green-500 rounded-full" />
          <span className="sr-only">Green</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleColorChange("#0000ff")}
          className={color === "#0000ff" ? "bg-muted" : ""}
        >
          <div className="w-5 h-5 bg-blue-500 rounded-full" />
          <span className="sr-only">Blue</span>
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <Button variant="ghost" size="icon" onClick={handleUndo}>
          <UndoIcon className="h-5 w-5" />
          <span className="sr-only">Undo</span>
        </Button>
        <Button variant="ghost" size="icon" onClick={handleRedo}>
          <RedoIcon className="h-5 w-5" />
          <span className="sr-only">Redo</span>
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <Button variant="ghost" size="icon" onClick={handleDownload}>
          <DownloadIcon className="h-5 w-5" />
          <span className="sr-only">Download</span>
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <Button variant="ghost" size="icon" onClick={handleClear}>
          <TrashIcon className="h-5 w-5" />
          <span className="sr-only">Clear</span>
        </Button>
      </div>
      <div className="flex-1 bg-white" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  )
}

function CircleIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  )
}


function DownloadIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  )
}


function EraserIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
      <path d="M22 21H7" />
      <path d="m5 11 9 9" />
    </svg>
  )
}


function PencilIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  )
}


function RectangleVerticalIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="12" height="20" x="6" y="2" rx="2" />
    </svg>
  )
}


function RedoIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 7v6h-6" />
      <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
    </svg>
  )
}


function ShapesIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <circle cx="17.5" cy="17.5" r="3.5" />
    </svg>
  )
}


function TrashIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  )
}


function TriangleIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M13.73 4a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    </svg>
  )
}


function UndoIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </svg>
  )
}
