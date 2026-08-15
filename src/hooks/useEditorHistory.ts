"use client";

import { useCallback, useReducer } from "react";
import { initialProject, projectReducer, type ProjectAction } from "@/editor/project-state";
import type { EditorProject } from "@/types/editor";

interface HistoryState {
  past: EditorProject[];
  present: EditorProject;
  future: EditorProject[];
}

type HistoryAction = ProjectAction | { type: "undo" } | { type: "redo" } | { type: "restore"; project: EditorProject };

function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  if (action.type === "undo") {
    const previous = state.past.at(-1);
    if (!previous) return state;
    return { past: state.past.slice(0, -1), present: previous, future: [state.present, ...state.future] };
  }
  if (action.type === "redo") {
    const next = state.future[0];
    if (!next) return state;
    return { past: [...state.past, state.present].slice(-80), present: next, future: state.future.slice(1) };
  }
  if (action.type === "restore") return { past: [], present: action.project, future: [] };
  const next = projectReducer(state.present, action);
  if (next === state.present) return state;
  return { past: [...state.past, state.present].slice(-80), present: next, future: [] };
}

export function useEditorHistory() {
  const [state, dispatch] = useReducer(historyReducer, { past: [], present: initialProject, future: [] });
  const undo = useCallback(() => dispatch({ type: "undo" }), []);
  const redo = useCallback(() => dispatch({ type: "redo" }), []);
  const restore = useCallback((project: EditorProject) => dispatch({ type: "restore", project }), []);
  return { project: state.present, dispatch, undo, redo, restore, canUndo: state.past.length > 0, canRedo: state.future.length > 0 };
}
