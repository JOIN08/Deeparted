import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Wrench,
  BedDouble,
  Navigation,
  Save,
  Trash2,
  Plus,
  Move,
  Layers,
  X,
  CheckCircle2,
  RotateCw,
  Eye,
  EyeOff,
  Layers3,
  Package,
  SlidersHorizontal,
} from "lucide-react";
import {
  BUNK_CONFIGURATION_STORAGE_KEY,
  PASSENGER_BUNK_AREAS,
  SHIP_PLAN_STORAGE_KEY,
} from "../data/mockData";

const GRID_SIZE = 20; // 20px grid unit
const getSavedBunkBeds = () => {
  try {
    const savedAreas = window.localStorage.getItem(
      BUNK_CONFIGURATION_STORAGE_KEY,
    );
    const savedArea = savedAreas ? JSON.parse(savedAreas)[0] : null;
    return (
      savedArea?.beds || PASSENGER_BUNK_AREAS[0].beds.map((bed) => ({ ...bed }))
    );
  } catch {
    return PASSENGER_BUNK_AREAS[0].beds.map((bed) => ({ ...bed }));
  }
};

export function ShipBuilder() {
  const [vesselName, setVesselName] = useState("MV Trans-Asia 12");

  // Floor / Deck Management State
  const [floors, setFloors] = useState([
    { id: "deck-1", name: "Deck 1 (Lower Hull)" },
    { id: "deck-2", name: "Deck 2 (Tourist Class)" },
  ]);
  const [isPlanLoaded, setIsPlanLoaded] = useState(false);
  const [activeFloorId, setActiveFloorId] = useState("deck-2");

  // Macro Deck Compartments
  const [zones, setZones] = useState([
    {
      id: "1",
      floorId: "deck-2",
      type: "Navigation Bridge",
      label: "Main Bridge",
      x: 600,
      y: 120,
      width: 80,
      height: 80,
      color: "bg-sky-500/20 border-sky-500 text-sky-400",
      beds: [],
    },
    {
      id: "2",
      floorId: "deck-2",
      type: "Passenger Bunk Area",
      label: "Tourist Sec A",
      x: 260,
      y: 100,
      width: 140,
      height: 100,
      color: "bg-indigo-500/20 border-indigo-500 text-indigo-400",
      beds: getSavedBunkBeds(),
    },
    {
      id: "3",
      floorId: "deck-1",
      type: "Engine Room",
      label: "Primary Engine",
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      color: "bg-red-500/20 border-red-500 text-red-400",
      engineSpecs: {
        horsepower: "12000 HP",
        fuelType: "Marine Diesel",
        status: "Operational",
      },
    },
    {
      id: "4",
      floorId: "deck-1",
      type: "Cargo Hold",
      label: "Main Cargo Bay",
      x: 240,
      y: 80,
      width: 180,
      height: 140,
      color: "bg-amber-500/20 border-amber-500 text-amber-400",
      cargoItems: [
        { id: "c1", name: "Grain Containers", weight: "45T", qty: 12 },
        { id: "c2", name: "Machinery Cates", weight: "20T", qty: 4 },
      ],
    },
  ]);

  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [activeBunkEditorZone, setActiveBunkEditorZone] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const deckRef = useRef(null);

  // Bunk Canvas & Selection State
  const [selectedBedIds, setSelectedBedIds] = useState([]);
  const [showLower, setShowLower] = useState(true);
  const [showTop, setShowTop] = useState(true);

  // Marquee Selection Box State
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState(null);

  // Dragging Beds State
  const [isDraggingBeds, setIsDraggingBeds] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [initialBedPositions, setInitialBedPositions] = useState({});
  const bunkCanvasRef = useRef(null);

  // Cargo Input Fields State
  const [newCargoName, setNewCargoName] = useState("");
  const [newCargoWeight, setNewCargoWeight] = useState("");
  const [newCargoQty, setNewCargoQty] = useState(1);

  useEffect(() => {
    const restorePlan = window.setTimeout(() => {
      try {
        const savedPlan = window.localStorage.getItem(SHIP_PLAN_STORAGE_KEY);
        if (savedPlan) {
          const parsedPlan = JSON.parse(savedPlan);
          if (Array.isArray(parsedPlan.floors)) setFloors(parsedPlan.floors);
          if (Array.isArray(parsedPlan.zones)) setZones(parsedPlan.zones);
        }
      } catch {
        // Keep the default deck plan when saved data is unavailable or invalid.
      }
      setIsPlanLoaded(true);
    }, 0);
    return () => window.clearTimeout(restorePlan);
  }, []);

  useEffect(() => {
    if (!isPlanLoaded) return;
    window.localStorage.setItem(
      SHIP_PLAN_STORAGE_KEY,
      JSON.stringify({ vesselName, floors, zones }),
    );
  }, [isPlanLoaded, vesselName, floors, zones]);

  useEffect(() => {
    const bunkAreas = zones
      .filter((zone) => zone.type === "Passenger Bunk Area")
      .map((zone) => ({
        id: zone.id,
        label: zone.label,
        accommodation: zone.label.replace(/\s+Sec.*$/i, "").trim() || "Tourist",
        beds: zone.beds || [],
      }));
    window.localStorage.setItem(
      BUNK_CONFIGURATION_STORAGE_KEY,
      JSON.stringify(bunkAreas),
    );
    window.dispatchEvent(new Event("passenger-bunks-updated"));
  }, [zones]);

  const snapToGrid = (val) => Math.round(val / GRID_SIZE) * GRID_SIZE;
  const saveDeckPlan = () => {
    window.localStorage.setItem(
      SHIP_PLAN_STORAGE_KEY,
      JSON.stringify({ vesselName, floors, zones }),
    );
    alert("Saved multi-deck setup!");
  };

  // Deck Controls
  const addFloor = () => {
    const nextNum = floors.length + 1;
    const newFloor = { id: `deck-${Date.now()}`, name: `Deck ${nextNum}` };
    setFloors([...floors, newFloor]);
    setActiveFloorId(newFloor.id);
  };

  const removeFloor = (floorId) => {
    if (floors.length <= 1)
      return alert("At least one deck floor is required.");
    setFloors(floors.filter((f) => f.id !== floorId));
    setZones(zones.filter((z) => z.floorId !== floorId));
    const remaining = floors.find((f) => f.id !== floorId);
    if (remaining) setActiveFloorId(remaining.id);
  };

  // Macro Deck Dragging
  const handleMouseDown = (e, zone) => {
    e.stopPropagation();
    setSelectedZoneId(zone.id);
    setDraggingId(zone.id);
    const deckRect = deckRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - deckRect.left - zone.x,
      y: e.clientY - deckRect.top - zone.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!draggingId || !deckRef.current) return;
    const deckRect = deckRef.current.getBoundingClientRect();
    const rawX = e.clientX - deckRect.left - dragOffset.x;
    const rawY = e.clientY - deckRect.top - dragOffset.y;

    const currentZone = zones.find((z) => z.id === draggingId);
    const zWidth = currentZone ? currentZone.width : 80;
    const zHeight = currentZone ? currentZone.height : 80;

    const snappedX = Math.max(0, Math.min(880 - zWidth, snapToGrid(rawX)));
    const snappedY = Math.max(0, Math.min(340 - zHeight, snapToGrid(rawY)));

    setZones(
      zones.map((z) =>
        z.id === draggingId ? { ...z, x: snappedX, y: snappedY } : z,
      ),
    );
  };

  const handleMouseUp = () => setDraggingId(null);

  // Single Consolidated Compartment Creator
  const createNewCompartment = () => {
    const newZone = {
      id: Date.now().toString(),
      floorId: activeFloorId,
      type: "Cargo Hold",
      label: `Compartment ${zones.length + 1}`,
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      color: "bg-amber-500/20 border-amber-500 text-amber-400",
      cargoItems: [],
    };
    setZones([...zones, newZone]);
    setSelectedZoneId(newZone.id);
  };

  // Type Color Picker Switcher
  const updateZoneType = (zoneId, type) => {
    let color = "bg-slate-500/20 border-slate-500 text-slate-300";
    let extraAttrs = {};

    if (type === "Cargo Hold") {
      color = "bg-amber-500/20 border-amber-500 text-amber-400";
      extraAttrs = { cargoItems: [] };
    } else if (type === "Engine Room") {
      color = "bg-red-500/20 border-red-500 text-red-400";
      extraAttrs = {
        engineSpecs: {
          horsepower: "8000 HP",
          fuelType: "Diesel",
          status: "Operational",
        },
      };
    } else if (type === "Passenger Bunk Area") {
      color = "bg-indigo-500/20 border-indigo-500 text-indigo-400";
      extraAttrs = { beds: [] };
    } else if (type === "Navigation Bridge") {
      color = "bg-sky-500/20 border-sky-500 text-sky-400";
    }

    setZones(
      zones.map((z) =>
        z.id === zoneId ? { ...z, type, color, ...extraAttrs } : z,
      ),
    );
  };

  // Cargo Attribute Helpers
  const addCargoItem = (zoneId) => {
    if (!newCargoName) return;
    const newItem = {
      id: `c-${Date.now()}`,
      name: newCargoName,
      weight: newCargoWeight || "0T",
      qty: Number(newCargoQty) || 1,
    };
    setZones(
      zones.map((z) =>
        z.id === zoneId
          ? { ...z, cargoItems: [...(z.cargoItems || []), newItem] }
          : z,
      ),
    );
    setNewCargoName("");
    setNewCargoWeight("");
    setNewCargoQty(1);
  };

  const removeCargoItem = (zoneId, itemId) => {
    setZones(
      zones.map((z) =>
        z.id === zoneId
          ? { ...z, cargoItems: z.cargoItems.filter((i) => i.id !== itemId) }
          : z,
      ),
    );
  };

  // Canvas Mouse Down: Marquee Select or Drag Bunks
  const handleCanvasMouseDown = (e) => {
    if (!bunkCanvasRef.current) return;
    const canvasRect = bunkCanvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - canvasRect.left;
    const clickY = e.clientY - canvasRect.top;

    setIsSelecting(true);
    setSelectedBedIds([]);
    setSelectionBox({ x1: clickX, y1: clickY, x2: clickX, y2: clickY });
  };

  const handleBedMouseDown = (e, bed) => {
    e.stopPropagation();
    if (!bunkCanvasRef.current || !activeBunkEditorZone) return;

    let currentSelected = selectedBedIds;
    if (!selectedBedIds.includes(bed.id)) {
      currentSelected = [bed.id];
      setSelectedBedIds([bed.id]);
    }

    const canvasRect = bunkCanvasRef.current.getBoundingClientRect();
    setIsDraggingBeds(true);
    setDragStartPos({
      x: e.clientX - canvasRect.left,
      y: e.clientY - canvasRect.top,
    });

    const initPosMap = {};
    activeBunkEditorZone.beds.forEach((b) => {
      if (currentSelected.includes(b.id)) {
        initPosMap[b.id] = { x: b.x, y: b.y };
      }
    });
    setInitialBedPositions(initPosMap);
  };

  const handleCanvasMouseMove = (e) => {
    if (!bunkCanvasRef.current || !activeBunkEditorZone) return;
    const canvasRect = bunkCanvasRef.current.getBoundingClientRect();
    const currentX = e.clientX - canvasRect.left;
    const currentY = e.clientY - canvasRect.top;

    if (isSelecting && selectionBox) {
      const x1 = selectionBox.x1;
      const y1 = selectionBox.y1;
      const x2 = currentX;
      const y2 = currentY;

      setSelectionBox({ x1, y1, x2, y2 });

      const boxLeft = Math.min(x1, x2);
      const boxRight = Math.max(x1, x2);
      const boxTop = Math.min(y1, y2);
      const boxBottom = Math.max(y1, y2);

      const newlySelected = activeBunkEditorZone.beds
        .filter((bed) => {
          if (bed.level === "Lower" && !showLower) return false;
          if (bed.level === "Top" && !showTop) return false;

          const bedW = bed.isVertical ? 40 : 60;
          const bedH = bed.isVertical ? 60 : 40;

          return (
            bed.x < boxRight &&
            bed.x + bedW > boxLeft &&
            bed.y < boxBottom &&
            bed.y + bedH > boxTop
          );
        })
        .map((b) => b.id);

      setSelectedBedIds(newlySelected);
      return;
    }

    if (isDraggingBeds) {
      const deltaX = currentX - dragStartPos.x;
      const deltaY = currentY - dragStartPos.y;

      const updatedBeds = activeBunkEditorZone.beds.map((bed) => {
        if (selectedBedIds.includes(bed.id) && initialBedPositions[bed.id]) {
          const init = initialBedPositions[bed.id];
          const bedW = bed.isVertical ? 40 : 60;
          const bedH = bed.isVertical ? 60 : 40;

          const rawX = init.x + deltaX;
          const rawY = init.y + deltaY;

          const snappedX = Math.max(0, Math.min(1400 - bedW, snapToGrid(rawX)));
          const snappedY = Math.max(0, Math.min(900 - bedH, snapToGrid(rawY)));

          return { ...bed, x: snappedX, y: snappedY };
        }
        return bed;
      });

      const updatedZone = { ...activeBunkEditorZone, beds: updatedBeds };
      setActiveBunkEditorZone(updatedZone);
      setZones(zones.map((z) => (z.id === updatedZone.id ? updatedZone : z)));
    }
  };

  const handleCanvasMouseUp = () => {
    setIsSelecting(false);
    setSelectionBox(null);
    setIsDraggingBeds(false);
  };

  const toggleRotateBed = (bedId) => {
    if (!activeBunkEditorZone) return;
    const updatedBeds = activeBunkEditorZone.beds.map((bed) => {
      if (bed.id === bedId) {
        return { ...bed, isVertical: !bed.isVertical };
      }
      return bed;
    });
    const updatedZone = { ...activeBunkEditorZone, beds: updatedBeds };
    setActiveBunkEditorZone(updatedZone);
    setZones(zones.map((z) => (z.id === updatedZone.id ? updatedZone : z)));
  };

  const addBunkToActiveZone = (level) => {
    if (!activeBunkEditorZone) return;
    const bedCount = (activeBunkEditorZone.beds?.length || 0) + 1;

    const spawnX = snapToGrid((bedCount * 80) % 1200);
    const spawnY = snapToGrid(Math.floor((bedCount * 80) / 1200) * 60 + 20);

    const newBed = {
      id: `bed-${Date.now()}`,
      label: `B-${bedCount}`,
      level: level,
      x: spawnX,
      y: spawnY,
      isVertical: false,
      status: "Available",
    };

    const updatedZone = {
      ...activeBunkEditorZone,
      beds: [...(activeBunkEditorZone.beds || []), newBed],
    };
    setActiveBunkEditorZone(updatedZone);
    setZones(zones.map((z) => (z.id === updatedZone.id ? updatedZone : z)));
  };

  const removeBunk = (bedId) => {
    const updatedZone = {
      ...activeBunkEditorZone,
      beds: activeBunkEditorZone.beds.filter((b) => b.id !== bedId),
    };
    setActiveBunkEditorZone(updatedZone);
    setZones(zones.map((z) => (z.id === updatedZone.id ? updatedZone : z)));
    setSelectedBedIds(selectedBedIds.filter((id) => id !== bedId));
  };

  // Active Floor Zones Filter
  const activeFloorZones = zones.filter((z) => z.floorId === activeFloorId);
  const selectedZone = zones.find((z) => z.id === selectedZoneId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#0f172a] p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-500" /> Multi-Deck Spatial
            Vessel Designer
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Box-edged compartments, custom attribute configuration, and
            boat-shaped deck grid.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            value={vesselName}
            onChange={(e) => setVesselName(e.target.value)}
            className="px-3 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
          <button
            onClick={saveDeckPlan}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-blue-600/20"
          >
            <Save className="w-4 h-4" /> Save Deck Plan
          </button>
        </div>
      </div>

      {/* Vessel Floor / Deck Selector Bar */}
      <div className="bg-white p-3 border border-slate-200 shadow-sm flex items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 px-2">
            <Layers3 className="w-4 h-4 text-teal-500" /> Active Floor:
          </span>
          {floors.map((floor) => (
            <button
              key={floor.id}
              onClick={() => {
                setActiveFloorId(floor.id);
                setSelectedZoneId(null);
              }}
              className={`px-4 py-2 text-xs font-bold transition-all flex items-center gap-2 rounded ${
                activeFloorId === floor.id
                  ? "bg-teal-300 text-teal-950 shadow-md dark:bg-teal-700 dark:text-teal-50"
                  : "bg-teal-100 text-teal-700 hover:bg-teal-200 dark:bg-teal-900 dark:text-teal-100 dark:hover:bg-teal-800"
              }`}
            >
              <span>{floor.name}</span>
              {/* Internal Delete Button to Prevent Row Shifting */}

              {floors.length > 1 && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFloor(floor.id);
                  }}
                  title="Delete floor"
                  className="p-0.5 hover:bg-teal-600 rounded transition-colors text-white/80 hover:text-white ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </span>
              )}
            </button>
          ))}
        </div>
        <button
          onClick={addFloor}
          className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4 text-blue-500" /> Add Deck Floor
        </button>
      </div>

      {/* TOP: Boat Deck Canvas Grid */}
      <div className="bg-white dark:bg-[#0f172a] p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center min-h-[460px]">
        <div className="w-full flex items-center justify-between mb-4">
          <span className="w-full text-center text-xs font-bold text-blue-500 uppercase tracking-widest">
            {floors.find((f) => f.id === activeFloorId)?.name} Grid
          </span>
        </div>

        {/* Larger Boat-Shaped Hull Frame */}
        <div
          ref={deckRef}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="relative w-[900px] h-[360px] border-2 border-slate-700 dark:border-slate-600 bg-slate-900/90 overflow-hidden select-none shadow-inner rounded-r-[180px] rounded-l-none"
        >
          {/* 20px Crisp Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:20px_20px] opacity-40 pointer-events-none" />

          {activeFloorZones.map((zone) => {
            const isSelected = selectedZoneId === zone.id;
            const isBunkArea = zone.type === "Passenger Bunk Area";
            const isCargo = zone.type === "Cargo Hold";

            return (
              <div
                key={zone.id}
                onMouseDown={(e) => handleMouseDown(e, zone)}
                style={{
                  left: `${zone.x}px`,
                  top: `${zone.y}px`,
                  width: `${zone.width}px`,
                  height: `${zone.height}px`,
                }}
                className={`absolute border-2 box-border rounded-none backdrop-blur-sm p-1.5 flex flex-col items-center justify-between cursor-grab active:cursor-grabbing transition-all ${zone.color} ${
                  isSelected
                    ? "ring-2 ring-white border-white z-20 shadow-lg"
                    : "z-10"
                }`}
              >
                <div className="text-center w-full my-auto overflow-hidden">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider truncate px-0.5">
                    {zone.label}
                  </p>
                  <p className="text-[9px] opacity-75 truncate">{zone.type}</p>
                </div>

                {/* Quick Interactive Tooltip Indicators */}
                {isBunkArea && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveBunkEditorZone(zone);
                      setSelectedBedIds([]);
                    }}
                    className="w-full py-0.5 bg-indigo-500/30 hover:bg-indigo-500/50 border border-indigo-400 text-indigo-200 text-[9px] font-bold flex items-center justify-center gap-1"
                  >
                    <BedDouble className="w-3 h-3" /> {zone.beds?.length || 0}{" "}
                    Beds
                  </button>
                )}

                {isCargo && zone.cargoItems && zone.cargoItems.length > 0 && (
                  <div className="text-[8px] bg-amber-500/30 border border-amber-400/50 px-1 py-0.5 w-full text-center truncate">
                    <Package className="w-2.5 h-2.5 inline mr-1" />
                    {zone.cargoItems.length} Cargo Types
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTTOM: Compartments Tool & Custom Attribute Settings (Placed Under Deck Canvas) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Add Compartment Tool */}
        <div className="bg-white dark:bg-[#0f172a] p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Box className="w-4 h-4 text-amber-500" /> Compartment Library
            </h3>
          </div>

          <button
            onClick={createNewCompartment}
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-amber-600/20"
          >
            <Plus className="w-4 h-4" /> Add Compartment
          </button>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Clicking <strong>+ Add Compartment</strong> creates a new
            sharp-edged compartment on the active deck. Select any placed
            compartment to configure its label, dimensions, and type-specific
            attributes below.
          </p>
        </div>

        {/* Right: Selected Compartment Attributes & Custom Settings */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0f172a] p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          {selectedZone && selectedZone.floorId === activeFloorId ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-blue-500" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Compartment Attributes
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setZones(zones.filter((z) => z.id !== selectedZone.id));
                    setSelectedZoneId(null);
                  }}
                  className="text-red-500 hover:text-red-600 text-xs font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove Compartment
                </button>
              </div>

              {/* Basic Details & Dimensions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                    Compartment Name / Label
                  </label>
                  <input
                    type="text"
                    value={selectedZone.label}
                    onChange={(e) =>
                      setZones(
                        zones.map((z) =>
                          z.id === selectedZone.id
                            ? { ...z, label: e.target.value }
                            : z,
                        ),
                      )
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                    Compartment Purpose / Type
                  </label>
                  <select
                    value={selectedZone.type}
                    onChange={(e) =>
                      updateZoneType(selectedZone.id, e.target.value)
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Cargo Hold">Cargo Hold</option>
                    <option value="Engine Room">Engine Room</option>
                    <option value="Passenger Bunk Area">
                      Passenger Bunk Area
                    </option>
                    <option value="Navigation Bridge">Navigation Bridge</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                      Width (px)
                    </label>
                    <input
                      type="number"
                      step={GRID_SIZE}
                      min={40}
                      max={400}
                      value={selectedZone.width}
                      onChange={(e) => {
                        const newW = snapToGrid(
                          Math.max(40, Number(e.target.value)),
                        );
                        setZones(
                          zones.map((z) =>
                            z.id === selectedZone.id
                              ? { ...z, width: newW }
                              : z,
                          ),
                        );
                      }}
                      className="w-full px-2 py-1.5 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                      Height (px)
                    </label>
                    <input
                      type="number"
                      step={GRID_SIZE}
                      min={40}
                      max={340}
                      value={selectedZone.height}
                      onChange={(e) => {
                        const newH = snapToGrid(
                          Math.max(40, Number(e.target.value)),
                        );
                        setZones(
                          zones.map((z) =>
                            z.id === selectedZone.id
                              ? { ...z, height: newH }
                              : z,
                          ),
                        );
                      }}
                      className="w-full px-2 py-1.5 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Type-Specific Attribute Attachments */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                {/* 1. Cargo Hold Attributes */}
                {selectedZone.type === "Cargo Hold" && (
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Package className="w-4 h-4" /> Cargo Hold Details &
                      Inventory
                    </span>

                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        placeholder="Cargo description (e.g., Timber)"
                        value={newCargoName}
                        onChange={(e) => setNewCargoName(e.target.value)}
                        className="px-2.5 py-1 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white flex-1"
                      />
                      <input
                        type="text"
                        placeholder="Weight (e.g. 15T)"
                        value={newCargoWeight}
                        onChange={(e) => setNewCargoWeight(e.target.value)}
                        className="w-24 px-2 py-1 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={newCargoQty}
                        onChange={(e) => setNewCargoQty(e.target.value)}
                        className="w-16 px-2 py-1 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                      <button
                        onClick={() => addCargoItem(selectedZone.id)}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0"
                      >
                        Add Cargo
                      </button>
                    </div>

                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {selectedZone.cargoItems &&
                      selectedZone.cargoItems.length > 0 ? (
                        selectedZone.cargoItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200"
                          >
                            <span>
                              <strong>{item.name}</strong> ({item.weight})
                              &times; {item.qty}
                            </span>
                            <button
                              onClick={() =>
                                removeCargoItem(selectedZone.id, item.id)
                              }
                              className="text-red-400 hover:text-red-300"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-[10px] text-slate-400 italic">
                          No cargo assigned to this hold.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. Engine Room Attributes */}
                {selectedZone.type === "Engine Room" && (
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                      <Wrench className="w-4 h-4" /> Engine Room Technical
                      Specifications
                    </span>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] text-slate-400">
                          Horsepower
                        </label>
                        <input
                          type="text"
                          value={selectedZone.engineSpecs?.horsepower || ""}
                          onChange={(e) =>
                            setZones(
                              zones.map((z) =>
                                z.id === selectedZone.id
                                  ? {
                                      ...z,
                                      engineSpecs: {
                                        ...z.engineSpecs,
                                        horsepower: e.target.value,
                                      },
                                    }
                                  : z,
                              ),
                            )
                          }
                          className="w-full px-2 py-1 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400">
                          Fuel Type
                        </label>
                        <input
                          type="text"
                          value={selectedZone.engineSpecs?.fuelType || ""}
                          onChange={(e) =>
                            setZones(
                              zones.map((z) =>
                                z.id === selectedZone.id
                                  ? {
                                      ...z,
                                      engineSpecs: {
                                        ...z.engineSpecs,
                                        fuelType: e.target.value,
                                      },
                                    }
                                  : z,
                              ),
                            )
                          }
                          className="w-full px-2 py-1 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400">
                          Status
                        </label>
                        <select
                          value={
                            selectedZone.engineSpecs?.status || "Operational"
                          }
                          onChange={(e) =>
                            setZones(
                              zones.map((z) =>
                                z.id === selectedZone.id
                                  ? {
                                      ...z,
                                      engineSpecs: {
                                        ...z.engineSpecs,
                                        status: e.target.value,
                                      },
                                    }
                                  : z,
                              ),
                            )
                          }
                          className="w-full px-2 py-1 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        >
                          <option value="Operational">Operational</option>
                          <option value="Maintenance">Maintenance</option>
                          <option value="Offline">Offline</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Passenger Bunk Area Attributes */}
                {selectedZone.type === "Passenger Bunk Area" && (
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                        <BedDouble className="w-4 h-4" /> Passenger Bunks Matrix
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Currently configured with{" "}
                        {selectedZone.beds?.length || 0} spatial bunks.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveBunkEditorZone(selectedZone);
                        setSelectedBedIds([]);
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/20"
                    >
                      <BedDouble className="w-4 h-4" /> Open Bunk Matrix Editor
                    </button>
                  </div>
                )}

                {/* 4. Navigation Bridge */}
                {selectedZone.type === "Navigation Bridge" && (
                  <p className="text-[10px] text-slate-400 italic flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5 text-sky-400" /> Bridge
                    attributes configured for Vessel Command & Radar.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[140px] text-slate-400 text-xs">
              <p>
                Select a compartment on the deck canvas above to customize its
                attributes.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ================= LEVEL 2: CANVAS MODAL WITH MULTI-SELECT & VISIBILITY FILTERS ================= */}
      {activeBunkEditorZone && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-2xl w-[95vw] h-[90vh] p-6 flex flex-col space-y-4 relative overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BedDouble className="w-5 h-5 text-indigo-500" /> Bunk Matrix
                  Editor ({activeBunkEditorZone.beds?.length || 0} Total Beds)
                </h3>
                <p className="text-xs text-slate-400">
                  Editing{" "}
                  <strong className="text-indigo-400">
                    {activeBunkEditorZone.label}
                  </strong>{" "}
                  on{" "}
                  <strong className="text-blue-400">
                    {floors.find((f) => f.id === activeFloorId)?.name}
                  </strong>
                </p>
              </div>
              <button
                onClick={() => setActiveBunkEditorZone(null)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Toolbar: Add Bunks & Level Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => addBunkToActiveZone("Lower")}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  <Plus className="w-4 h-4" /> Add Lower Bunk
                </button>
                <button
                  onClick={() => addBunkToActiveZone("Top")}
                  className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-sky-600/20"
                >
                  <Plus className="w-4 h-4" /> Add Top Bunk
                </button>
              </div>

              {/* Visibility Filter Tools */}
              <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 p-1.5 border border-slate-200 dark:border-slate-700 text-xs">
                <span className="text-slate-400 text-[11px] font-semibold pl-2">
                  Filter View:
                </span>
                <button
                  onClick={() => setShowLower(!showLower)}
                  className={`px-3 py-1 font-bold flex items-center gap-1.5 transition-all ${
                    showLower
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "bg-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {showLower ? (
                    <Eye className="w-3.5 h-3.5" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5" />
                  )}{" "}
                  Lower Bunks
                </button>
                <button
                  onClick={() => setShowTop(!showTop)}
                  className={`px-3 py-1 font-bold flex items-center gap-1.5 transition-all ${
                    showTop
                      ? "bg-sky-500 text-white shadow-sm"
                      : "bg-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {showTop ? (
                    <Eye className="w-3.5 h-3.5" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5" />
                  )}{" "}
                  Top Bunks
                </button>
              </div>
            </div>

            {/* Canvas Container */}
            <div className="flex-1 overflow-auto border-2 border-slate-300 dark:border-slate-800 bg-slate-950 relative shadow-inner">
              <div
                ref={bunkCanvasRef}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                className="w-[1400px] h-[900px] relative select-none cursor-crosshair"
              >
                {/* 20px Grid Lines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:20px_20px] opacity-40 pointer-events-none" />

                {/* Marquee Drag Box Overlay */}
                {isSelecting && selectionBox && (
                  <div
                    style={{
                      left: `${Math.min(selectionBox.x1, selectionBox.x2)}px`,
                      top: `${Math.min(selectionBox.y1, selectionBox.y2)}px`,
                      width: `${Math.abs(selectionBox.x2 - selectionBox.x1)}px`,
                      height: `${Math.abs(selectionBox.y2 - selectionBox.y1)}px`,
                    }}
                    className="absolute border-2 border-indigo-400 bg-indigo-500/20 z-30 pointer-events-none"
                  />
                )}

                {/* Render Bunks */}
                {activeBunkEditorZone.beds &&
                activeBunkEditorZone.beds.length > 0 ? (
                  activeBunkEditorZone.beds.map((bed) => {
                    const isTop = bed.level === "Top";
                    const isVert = bed.isVertical;

                    if (bed.level === "Lower" && !showLower) return null;
                    if (bed.level === "Top" && !showTop) return null;

                    const isSelected = selectedBedIds.includes(bed.id);

                    return (
                      <div
                        key={bed.id}
                        onMouseDown={(e) => handleBedMouseDown(e, bed)}
                        style={{
                          left: `${bed.x}px`,
                          top: `${bed.y}px`,
                          width: isVert ? "40px" : "60px",
                          height: isVert ? "60px" : "40px",
                        }}
                        className={`absolute border box-border cursor-grab active:cursor-grabbing flex ${
                          isVert
                            ? "flex-col justify-between py-1 px-1"
                            : "flex-row justify-between px-1.5 items-center"
                        } shadow-sm transition-shadow z-10 ${
                          isSelected
                            ? "ring-2 ring-amber-400 border-amber-300 z-20 shadow-lg"
                            : ""
                        } ${
                          isTop
                            ? "bg-sky-950/90 border-sky-400 text-sky-200"
                            : "bg-emerald-950/90 border-emerald-400 text-emerald-200"
                        }`}
                      >
                        <div className="leading-none text-left pointer-events-none">
                          <p className="text-[10px] font-extrabold text-white">
                            {bed.label}
                          </p>
                          <p className="text-[8px] opacity-80 mt-0.5">
                            {bed.level[0]}L
                          </p>
                        </div>

                        {/* Controls */}
                        <div
                          className={`flex items-center gap-0.5 ${isVert ? "flex-row justify-between w-full" : "flex-row"}`}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRotateBed(bed.id);
                            }}
                            title="Rotate orientation"
                            className="text-slate-300 hover:text-white p-0.5 hover:bg-white/10"
                          >
                            <RotateCw className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeBunk(bed.id);
                            }}
                            title="Delete bunk"
                            className="text-red-400 hover:text-red-300 p-0.5 hover:bg-white/10"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-slate-500 pointer-events-none">
                    Canvas empty. Add bunks above to start building the spatial
                    matrix!
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 flex justify-end shrink-0">
              <button
                onClick={() => setActiveBunkEditorZone(null)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30"
              >
                <CheckCircle2 className="w-4 h-4" /> Save Spatial Grid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
