
import React from 'react';

interface ProgressCircleProps {
    progress: number;
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({ progress }) => {
    const r = 50;
    const c = 2 * Math.PI * r;
    const offset = c - (progress / 100) * c;
    const color = progress > 80 ? 'stroke-green-500' : progress > 50 ? 'stroke-primary-500' : 'stroke-yellow-500';

    return (
        <svg className="w-24 h-24" viewBox="0 0 120 120">
            <circle className="text-gray-200" strokeWidth="10" stroke="currentColor" fill="transparent" r={r} cx="60" cy="60" />
            <circle
                className={`progress-ring__circle ${color}`}
                strokeWidth="10"
                strokeDasharray={`${c} ${c}`}
                style={{ strokeDashoffset: offset }}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r={r}
                cx="60"
                cy="60"
            />
            <text x="50%" y="50%" textAnchor="middle" dy=".3em" className="text-2xl font-semibold fill-current text-gray-700">
                {progress}%
            </text>
        </svg>
    );
};

export default ProgressCircle;