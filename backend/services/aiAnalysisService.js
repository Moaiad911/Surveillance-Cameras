const fetch = require('node-fetch');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const BATCH_SIZE = 16;
const MAX_CONCURRENT = 3;

class AIAnalysisService {
  constructor() {
    this.frameBuffers = new Map();
    this.pendingBatches = new Map();
  }

  addFrame(cameraId, frameBase64, onResult) {
    // console.log(`[AI] Frame added for ${cameraId}, buffer: ${(this.frameBuffers.get(cameraId)||[]).length+1}/${BATCH_SIZE}`);
    if (!this.frameBuffers.has(cameraId)) {
      this.frameBuffers.set(cameraId, []);
      this.pendingBatches.set(cameraId, []);
    }
    const buffer = this.frameBuffers.get(cameraId);
    buffer.push(frameBase64);
    if (buffer.length >= BATCH_SIZE) {
      const batch = buffer.splice(0, BATCH_SIZE);
      this._sendBatchConcurrent(cameraId, batch, onResult);
    }
  }

  _sendBatchConcurrent(cameraId, frames, onResult) {
    console.log(`[AI] 🚀 Sending batch of ${frames.length} frames for camera ${cameraId}`);
    const pending = this.pendingBatches.get(cameraId) || [];
    if (pending.length >= MAX_CONCURRENT) {
      console.log('[AI] Dropping batch - too many concurrent requests');
      return;
    }
    const batchPromise = this._processBatch(cameraId, frames, onResult)
      .finally(() => {
        const updated = this.pendingBatches.get(cameraId) || [];
        const idx = updated.indexOf(batchPromise);
        if (idx > -1) updated.splice(idx, 1);
      });
    pending.push(batchPromise);
    this.pendingBatches.set(cameraId, pending);
  }

  async _processBatch(cameraId, frames, onResult) {
    const startTime = Date.now();
    try {
      const response = await fetch(AI_SERVICE_URL + '/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frames,
          timestamp: new Date().toISOString(),
          save_features: false,
        }),
        timeout: 15000
      });
      if (!response.ok) {
        console.error('[AI] HTTP ' + response.status + ' for camera ' + cameraId);
        return;
      }
      const result = await response.json();
      const totalTime = Date.now() - startTime;
      console.log('[AI] Camera ' + cameraId + ': score=' + result.anomaly_score + ' class=' + result.predicted_class + ' time=' + totalTime + 'ms');
      if (onResult) {
        onResult({
          cameraId,
          anomalyScore: result.anomaly_score,
          isAnomaly: result.is_anomaly,
          predictedClass: result.predicted_class,
          predictedClassId: result.predicted_class_id,
          confidence: result.class_confidence,
          segmentScores: result.segment_scores,
          peakSegmentIdx: result.peak_segment_idx,
          localisation: result.localisation,
          inferenceTimeMs: result.inference_time_ms,
          totalTimeMs: totalTime,
          timestamp: result.timestamp,
          thresholdUsed: result.threshold_used,
        });
      }
      if (result.is_anomaly) {
        this._saveEvent(cameraId, result).catch(err =>
          console.error('[AI] Failed to save event:', err.message)
        );
      }
    } catch (err) {
      console.error('[AI] Error for camera ' + cameraId + ':', err.message);
    }
  }

  async _saveEvent(cameraId, result) {
    try {
      const EventModel = require('../models/EventModel');
      const severity = result.anomaly_score > 0.8 ? 'high' : result.anomaly_score > 0.5 ? 'medium' : 'low';
      await EventModel.create({
        cameraId,
        type: result.predicted_class,
        severity,
        description: result.predicted_class + ' detected (score: ' + result.anomaly_score.toFixed(2) + ')',
        anomalyScore: result.anomaly_score,
        confidence: result.class_confidence,
      });
      console.log('[AI] Event saved: ' + result.predicted_class);
    } catch (err) {
      console.error('[AI] Save event error:', err.message);
    }
  }

  clearCamera(cameraId) {
    this.frameBuffers.delete(cameraId);
    this.pendingBatches.delete(cameraId);
  }

  async checkHealth() {
    try {
      const res = await fetch(AI_SERVICE_URL + '/health', { timeout: 3000 });
      return await res.json();
    } catch {
      return { status: 'unavailable', model_loaded: false };
    }
  }
}

module.exports = new AIAnalysisService();