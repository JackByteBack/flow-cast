import { useState, useRef } from 'react';
import { api } from '../../services/api';
import { Camera, Upload, X, CheckCircle, AlertTriangle } from 'lucide-react';

export default function BarrierLensUpload({ onClose }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef();

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const lat = 6.5244 + (Math.random() - 0.5) * 0.02;
      const lng = 3.3792 + (Math.random() - 0.5) * 0.02;
      const data = await api.uploadPhoto(file, lat, lng, address || 'Auto-detected location');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const FEATURE_LABELS = {
    ramp: { label: 'Ramp', emoji: '♿', positive: true },
    stairs: { label: 'Stairs', emoji: '🪜', positive: false },
    elevator: { label: 'Elevator', emoji: '🛗', positive: true },
    handrail: { label: 'Handrail', emoji: '🦯', positive: true },
    obstacle: { label: 'Obstacle', emoji: '⚠️', positive: false },
    narrow_pathway: { label: 'Narrow Pathway', emoji: '🚧', positive: false },
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm sm:text-base">
          <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" /> BarrierLens Upload
        </h3>
        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {!result ? (
        <>
          {/* Upload Area */}
          <div
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-xl p-6 sm:p-8 text-center cursor-pointer hover:border-primary hover:bg-blue-50/50 transition-colors active:bg-blue-50"
          >
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-32 sm:max-h-40 mx-auto rounded-lg" />
            ) : (
              <>
                <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-xs sm:text-sm text-gray-500">Tap to upload or drag & drop</p>
                <p className="text-[10px] sm:text-xs text-gray-400 mt-1">JPEG, PNG, WebP (max 10MB)</p>
              </>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />

          {/* Address */}
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Location address (optional)"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          />

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs sm:text-sm">{error}</div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors disabled:opacity-40 text-sm"
          >
            {loading ? 'Analyzing...' : 'Upload & Analyze'}
          </button>
        </>
      ) : (
        /* Results */
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-success">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span className="font-semibold text-sm sm:text-base">Analysis Complete</span>
          </div>

          <div className="text-center py-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-gray-900">{result.overall_score}</span>
            <span className="text-xs sm:text-sm text-gray-500 ml-1">/10 Accessibility Score</span>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            {result.detections.map((det, i) => {
              const meta = FEATURE_LABELS[det.feature_type] || { label: det.feature_type, emoji: '❓', positive: false };
              return (
                <div key={i} className="flex items-center justify-between p-2.5 sm:p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{meta.emoji}</span>
                    <span className="text-xs sm:text-sm font-medium">{meta.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] sm:text-xs text-gray-500">{(det.confidence * 100).toFixed(0)}%</span>
                    {meta.positive ? (
                      <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-warning" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[10px] sm:text-xs text-amber-700">
            AI-detected observation — human verification recommended.
          </div>

          <button
            onClick={() => { setResult(null); setFile(null); setPreview(null); }}
            className="w-full py-2.5 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            Upload Another Photo
          </button>
        </div>
      )}
    </div>
  );
}
