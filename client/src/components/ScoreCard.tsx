import React, { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";

interface ScoreCardProps {
  title: string;
  score: number;
  maxScore?: number;
  icon?: React.ReactNode;
  color?: "primary" | "secondary" | "accent";
  description?: string;
}

export function ScoreCard({
  title,
  score,
  maxScore = 100,
  icon,
  color = "primary",
  description,
}: ScoreCardProps) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let current = 0;

    const increment = Math.ceil(score / 20);
    interval = setInterval(() => {
      current += increment;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(interval);
      } else {
        setDisplayScore(current);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [score]);

  const percentage = (displayScore / maxScore) * 100;
  const colorClass = {
    primary: "text-primary neon-glow",
    secondary: "text-secondary neon-glow-cyan",
    accent: "text-accent",
  }[color];

  const borderClass = {
    primary: "border-primary glow-box",
    secondary: "border-secondary glow-box-cyan",
    accent: "border-accent",
  }[color];

  const getScoreLabel = (s: number) => {
    if (s >= 90) return "Excellent";
    if (s >= 80) return "Very Good";
    if (s >= 70) return "Good";
    if (s >= 60) return "Fair";
    return "Needs Improvement";
  };

  return (
    <div className={`${borderClass} p-6 rounded-sm score-card`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {icon && <div className="text-secondary">{icon}</div>}
      </div>

      {/* Score Display */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2 mb-2">
          <span className={`text-4xl font-bold ${colorClass}`}>{displayScore}</span>
          <span className="text-muted-foreground">/ {maxScore}</span>
        </div>
        <p className={`text-sm font-semibold ${colorClass}`}>{getScoreLabel(displayScore)}</p>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar-neon">
        <div
          style={{ width: `${percentage}%` }}
          className="h-full transition-all duration-500"
        />
      </div>

      {/* Score Breakdown */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>
    </div>
  );
}

interface ScoreGridProps {
  atsScore: number;
  readabilityScore: number;
  children?: React.ReactNode;
}

export function ScoreGrid({ atsScore, readabilityScore, children }: ScoreGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <ScoreCard
        title="ATS Compatibility"
        score={atsScore}
        color="primary"
        icon={<TrendingUp size={24} />}
        description="How well your resume works with automated systems"
      />
      <ScoreCard
        title="Readability Score"
        score={readabilityScore}
        color="secondary"
        icon={<TrendingUp size={24} />}
        description="Clarity and professional presentation"
      />
      {children}
    </div>
  );
}
