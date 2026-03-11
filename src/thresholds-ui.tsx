import { VpdStage, VpdThresholds } from './types';
import { getActiveVpdThresholds, setVpdThresholds, resetVpdThresholds } from './thresholds';

export function ThresholdsForm() {
  const [thresholds, setThresholds] = React.useState<Record<VpdStage, VpdThresholds>>({
    [VpdStage.Propagation]: getActiveVpdThresholds(VpdStage.Propagation),
    [VpdStage.Veg]: getActiveVpdThresholds(VpdStage.Veg),
    [VpdStage.Flower]: getActiveVpdThresholds(VpdStage.Flower)
  });

  const handleSubmit = (stage: VpdStage, values: VpdThresholds) => {
    setVpdThresholds(stage, values);
    setThresholds(prev => ({ ...prev, [stage]: values }));
  };

  const handleReset = (stage: VpdStage) => {
    resetVpdThresholds(stage);
    setThresholds(prev => ({ ...prev, [stage]: getActiveVpdThresholds(stage) }));
  };

  return (
    <div className="threshold-controls">
      <h3>Custom VPD Thresholds</h3>
      {Object.values(VpdStage).map((stage) => (
        <StageThresholdForm
          key={stage}
          stage={stage}
          values={thresholds[stage]}
          onSubmit={handleSubmit}
          onReset={handleReset}
        />
      ))}
    </div>
  );
}

function StageThresholdForm({
  stage,
  values,
  onSubmit,
  onReset
}: {
  stage: VpdStage;
  values: VpdThresholds;
  onSubmit: (stage: VpdStage, values: VpdThresholds) => void;
  onReset: (stage: VpdStage) => void;
}) {
  const [low, setLow] = React.useState(values.low);
  const [high, setHigh] = React.useState(values.high);

  return (
    <div className="stage-threshold">
      <h4>{stage.charAt(0).toUpperCase() + stage.slice(1)}</h4>
      <div className="input-group">
        <label>Low Threshold (kPa):
          <input
            type="number"
            step="0.1"
            value={low}
            onChange={(e) => setLow(Number(e.target.value))}
          />
        </label>
        <label>High Threshold (kPa):
          <input
            type="number"
            step="0.1"
            value={high}
            onChange={(e) => setHigh(Number(e.target.value))}
          />
        </label>
      </div>
      <div className="form-actions">
        <button onClick={() => onSubmit(stage, { low, high })}>
          Save
        </button>
        <button onClick={() => onReset(stage)}>
          Reset to Default
        </button>
      </div>
    </div>
  );
}