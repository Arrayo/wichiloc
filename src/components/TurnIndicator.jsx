import {
  ArrowLeft, ArrowRight, ArrowUp,
  CornerUpLeft, CornerUpRight,
  CornerDownLeft, CornerDownRight,
  RotateCcw, RotateCw,
} from 'lucide-preact';
import './TurnIndicator.css';

const ICONS = {
  'left':          ArrowLeft,
  'right':         ArrowRight,
  'slight-left':   CornerUpLeft,
  'slight-right':  CornerUpRight,
  'sharp-left':    CornerDownLeft,
  'sharp-right':   CornerDownRight,
  'u-turn-left':   RotateCcw,
  'u-turn-right':  RotateCw,
};

const formatDist = (m) => {
  if (m === null || m === undefined) return '';
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`;
};

export const TurnIndicator = ({ nextTurn }) => {
  if (!nextTurn) return null;

  const Icon = ICONS[nextTurn.type] ?? ArrowUp;
  const dist = nextTurn.distance;

  return (
    <div className="turn-indicator">
      <div className="turn-arrow-wrap">
        <Icon size={22} />
      </div>
      <div className="turn-info">
        {dist !== null && <div className="turn-distance">{formatDist(dist)}</div>}
        <div className="turn-text">{nextTurn.text}</div>
      </div>
    </div>
  );
};
