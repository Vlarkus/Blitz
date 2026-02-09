import { useRef, useState, useMemo, useEffect } from "react";
import "./merge-overlay.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretUp, faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { useDataStore } from "../../../../models/dataStore";
import type { TrajectoryId } from "../../../../types/types";
import { Trajectory } from "../../../../models/entities/trajectory/trajectory";
import { ControlPoint } from "../../../../models/entities/control-point/controlPoint";
import { HelperPoint } from "../../../../models/entities/helper-point/helperPoint";

interface Props {
    onClose: () => void;
}

export default function MergeOverlay({ onClose }: Props) {
    const trajectories = useDataStore((s) => s.trajectories);
    const selectedControlPointIds = useDataStore((s) => s.selectedControlPointIds);

    const selectedTrajectoryId = useDataStore((s) => s.selectedTrajectoryId);

    // Identify which trajectories are involved in the selection
    const relevantTrajectories = useMemo(() => {
        const relevantIds = new Set<string>();
        if (selectedTrajectoryId) {
            relevantIds.add(selectedTrajectoryId);
        }
        for (const t of trajectories) {
            if (t.controlPoints.some((cp) => selectedControlPointIds.includes(cp.id))) {
                relevantIds.add(t.id);
            }
        }
        return trajectories.filter((t) => relevantIds.has(t.id));
    }, [trajectories, selectedControlPointIds, selectedTrajectoryId]);

    const [orderedIds, setOrderedIds] = useState<string[]>([]);
    const [selectedListId, setSelectedListId] = useState<string | null>(null);

    // Initialize defaults when relevantTrajectories changes
    useEffect(() => {
        const ids = relevantTrajectories.map(t => t.id);
        setOrderedIds(ids);
        // Default to the first item being selected (primary) if not already set or invalid
        if (ids.length > 0 && (!selectedListId || !ids.includes(selectedListId))) {
            setSelectedListId(ids[0]);
        }
    }, [relevantTrajectories]);


    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleApply = () => {
        if (!selectedListId) return;

        const state = useDataStore.getState();
        const primaryTraj = state.getTrajectoryById(selectedListId);
        if (!primaryTraj) return;

        // 1. Collect all CPs, deep copied
        const mergedCPs: ControlPoint[] = [];
        orderedIds.forEach(id => {
            const t = state.getTrajectoryById(id);
            if (t) {
                t.controlPoints.forEach(cp => mergedCPs.push(deepCopyControlPoint(cp)));
            }
        });

        // 2. Create new Trajectory
        const newTraj = new Trajectory(
            primaryTraj.name,
            mergedCPs,
            primaryTraj.color,
            primaryTraj.interpolationType,
            primaryTraj.interpolationDistance,
            primaryTraj.isVisible,
            primaryTraj.isLocked
        );

        // 3. Prepare undo/redo capture
        const trajectoriesToRemove = orderedIds
            .map(id => state.getTrajectoryById(id))
            .filter((t): t is Trajectory => !!t);

        state.execute({
            redo: () => {
                useDataStore.getState().addTrajectory(newTraj);
                trajectoriesToRemove.forEach(t => useDataStore.getState().removeTrajectory(t.id));
                useDataStore.getState().setSelectedTrajectoryId(newTraj.id);
            },
            undo: () => {
                useDataStore.getState().removeTrajectory(newTraj.id);
                // Add back original trajectories
                trajectoriesToRemove.forEach(t => useDataStore.getState().addTrajectory(t));
                useDataStore.getState().setSelectedTrajectoryId(primaryTraj.id);
            }
        });

        onClose();
    };

    const moveUp = (index: number) => {
        if (index <= 0) return;
        setOrderedIds(prev => {
            const next = [...prev];
            [next[index - 1], next[index]] = [next[index], next[index - 1]];
            return next;
        });
    };

    const moveDown = (index: number) => {
        if (index >= orderedIds.length - 1) return;
        setOrderedIds(prev => {
            const next = [...prev];
            [next[index], next[index + 1]] = [next[index + 1], next[index]];
            return next;
        });
    };

    return (
        <div className="merge-overlay-backdrop" onClick={handleBackdropClick}>
            <div className="merge-overlay">
                <div className="merge-topbar">
                    <div className="merge-title">Merge Trajectories</div>
                </div>
                <div className="merge-content">
                    <div className="merge-list">
                        {orderedIds.map((id, index) => {
                            const traj = trajectories.find(t => t.id === id);
                            if (!traj) return null;
                            const isPrimary = id === selectedListId;
                            return (
                                <div
                                    key={id}
                                    className={`merge-list-item ${isPrimary ? "primary" : ""}`}
                                    onClick={() => setSelectedListId(id)}
                                >
                                    <span className="order-number">{index + 1}.</span>
                                    <span className="traj-name" title={traj.name}>{traj.name}</span>
                                    <div className="order-actions">
                                        <button
                                            className="move-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                moveUp(index);
                                            }}
                                            disabled={index === 0}
                                        >
                                            <FontAwesomeIcon icon={faCaretUp} />
                                        </button>
                                        <button
                                            className="move-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                moveDown(index);
                                            }}
                                            disabled={index === orderedIds.length - 1}
                                        >
                                            <FontAwesomeIcon icon={faCaretDown} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="merge-footer">
                    <button className="apply-button" onClick={handleApply}>
                        Apply
                    </button>
                    <button className="cancel-button" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

function deepCopyHandle(h: HelperPoint): HelperPoint {
    return new HelperPoint(h.r, h.theta, h.isLinear);
}

function deepCopyControlPoint(cp: ControlPoint): ControlPoint {
    return new ControlPoint(
        cp.name,
        cp.x,
        cp.y,
        cp.heading,
        cp.splineType,
        cp.symmetry,
        deepCopyHandle(cp.handleIn),
        deepCopyHandle(cp.handleOut),
        cp.isLocked,
        cp.isEvent
    );
}
